import { Injectable, InternalServerErrorException, BadRequestException } from '@vision/common';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { successOptWithDataNoValidation } from '@vision/common/messages';
import { LeasingApplyStatusEnum } from '../../../Core/leasing-apply/enums/leasing-apply-status.enum';
import { LeasingApplyDocument } from '../../../Core/leasing-apply/interfaces/leasing-apply.interface';
import { LeasingApplyCoreService } from '../../../Core/leasing-apply/leasing-apply.service';
import { LeasingInstallments } from '../../../Core/leasing-installments/interfaces/leasing-installments.interface';
import { LeasingOption, LeasingOptionDocument } from '../../../Core/leasing-option/interfaces/leasing-option.interface';
import {
  LeasingUserCredit,
  LeasingUserCreditDocument,
} from '../../../Core/leasing-user-credit/interfaces/leasing-user-credit.interface';
import * as JalaliMoment from 'jalali-moment';
import { LeasingContract } from '../../../Core/leasing-contract/interfaces/leasing-contract.interface';
import { LeasingContractCoreService } from '../../../Core/leasing-contract/leasing-contract.service';
import { AccountService } from '../../../Core/useraccount/account/account.service';
import { LeasingUserCreditCoreService } from '../../../Core/leasing-user-credit/leasing-user-credit.service';
import { LeasingInstallmentsCoreService } from '../../../Core/leasing-installments/leasing-installments.service';
import { TurnoverBalanceCoreService } from '../../../Core/turnover/services/balance.service';
import { UserService } from '../../../Core/useraccount/user/user.service';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { ClubCoreService } from '../../../Core/customerclub/club.service';

@Injectable()
export class LeasingApplySettlementService {
  constructor(
    private readonly leasingApplyCoreService: LeasingApplyCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService,
    private readonly accountsCoreService: AccountService,
    private readonly leasingUserCreditCoreService: LeasingUserCreditCoreService,
    private readonly leasingInstallmentsCoreService: LeasingInstallmentsCoreService,
    private readonly turnoverCoreService: TurnoverBalanceCoreService,
    private readonly userCoreService: UserService,
    private readonly customerClubService: ClubCoreService
  ) {}

  async actionIPG(applyData: LeasingApplyDocument): Promise<void> {
    // set the leasing-apply document as paidByLeasing
    await this.leasingApplyCoreService.setAsPaid(applyData._id);
    // add a turnover document
    const ref = 'lecredit' + '-' + new Date().getTime();
    const title = 'شارژ کارت اعتباری توسط' + ' ' + applyData.leasingInfo.title + ' ' + 'پس از تأیید درخواست اعتبار';
    this.turnoverCoreService.ChargeUserLecredit(
      'lecredit',
      applyData.applicant._id,
      (applyData.leasingOption as LeasingOption).amount,
      ref,
      title,
      applyData.leasingUser,
      applyData._id
    );
    return this.changeStatus(applyData._id);
  }

  private async changeStatus(applyId: string): Promise<any> {
    const data = await this.leasingApplyCoreService.updateStatus(applyId, {
      status: LeasingApplyStatusEnum.ACCEPTED,
      message: '',
    });

    if (!data) throw new UserCustomException('درخواست اعتبار یافت نشد');

    // This means that this loan application has not been accepted before, and it's the first time
    await this.decreaseLeasingContractRemain(data);
    await this.createLeasingUserCredit(data);
    return successOptWithDataNoValidation(data);
  }

  private async decreaseLeasingContractRemain(data: LeasingApplyDocument): Promise<LeasingContract> {
    const option = data.leasingOption as LeasingOption;
    const applicant = data.applicant as any;
    const decreaseResult = await this.leasingContractCoreService.decreaseLeasingContractRemain(
      data.leasingUser._id,
      option.amount
    );
    if (decreaseResult) {
      const title = `کسر از موجودی اعتبار قرارداد به دلیل اعطای اعتبار به ${applicant.fullname}`;
      await this.accountsCoreService.accountSetLogg(
        title,
        'LeCredit',
        option.amount,
        true,
        data.leasingUser._id,
        null,
        null
      );
    }

    return decreaseResult;
  }

  private async createLeasingUserCredit(data: LeasingApplyDocument): Promise<void> {
    try {
      const option = data.leasingOption as LeasingOptionDocument;
      const leasingUserCredit: LeasingUserCredit = {
        leasingOption: option._id,
        amount: option.amount,
        leasingApply: data._id,
        user: data.applicant,
        leasingUser: data.leasingUser,
        block: false,
      };
      const userCredit = await this.leasingUserCreditCoreService.createUserCredits(leasingUserCredit);
      await this.chargeUserLeCreditAccount(data);
      await this.generateUserLeasingInstallments(data, userCredit);
      return;
    } catch (e) {
      console.log(e);
      throw new BadRequestException('خطا در ثبت اعتبار');
    }
  }

  private async chargeUserLeCreditAccount(data: LeasingApplyDocument): Promise<void> {
    try {
      const amount = (data.leasingOption as LeasingOption).amount;
      await this.accountsCoreService.chargeAccount(data.applicant, 'lecredit', amount);
      const title = `شارژ کارت اعتباری`;
      await this.accountsCoreService.accountSetLogg(title, 'LeCredit', amount, true, data.leasingUser, data.applicant);
      const userData = await this.userCoreService.getInfoByUserid(data.applicant);
      if (userData && userData.mobile) {
        SendAsanakSms(
          process.env.ASANAK_USERNAME,
          process.env.ASANAK_PASSWORD,
          process.env.ASANAK_NUMBER,
          '0' + userData.mobile,
          `درخواست وام "${(data.leasingOption as LeasingOption).title}" شما نهایی شد و مبلغ ${
            (data.leasingOption as LeasingOption).amount
          } ریال به عنوان موجودی اعتباری شما شارژ شد.`
        )
          .then()
          .catch();
      }
      const leasingUserData = await this.userCoreService.getInfoByUserid(data.leasingUser);
      if (leasingUserData.ref) {
        const club = await this.customerClubService.getClubInfoByOwner(leasingUserData.ref);
        if (club && club.user) {
          const leasingClubUser = await this.userCoreService.getInfoByUserid(club.user);
          if (leasingClubUser && leasingClubUser.mobile)
            SendAsanakSms(
              process.env.ASANAK_USERNAME,
              process.env.ASANAK_PASSWORD,
              process.env.ASANAK_NUMBER,
              '0' + leasingClubUser.mobile,
              ` وام "${(data.leasingOption as LeasingOption).title}" برای کاربر "${
                userData.fullname ?? userData.mobile
              }" توسط سرمایه گذار تایید نهایی و پرداخت شد.`
            )
              .then(() => console.log('sms to club user sent!'))
              .catch();
        }
      }
      return;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('خطا در ثبت اعتبار');
    }
  }

  private async generateUserLeasingInstallments(
    data: LeasingApplyDocument,
    userCredit: LeasingUserCreditDocument
  ): Promise<void> {
    try {
      const option = data.leasingOption as LeasingOption;
      const months = option.months;
      const interest = option.interest;
      const percent = interest / 100;
      const amount = option.amount;

      for (let i = 1; i <= months; i++) {
        const installmentData = await this.normalizeInstallmentData(
          i,
          amount,
          percent,
          months,
          data.applicant,
          userCredit._id
        );
        await this.leasingInstallmentsCoreService.create(installmentData);
      }

      return;
    } catch (e) {
      throw new InternalServerErrorException('خطا در ایجاد اقساط اعتبار');
    }
  }

  private async normalizeInstallmentData(
    currentIndex: number,
    amount: number,
    percent: number,
    months: number,
    applicant: string,
    userCreditId: string
  ): Promise<LeasingInstallments> {
    const totalAmountWithInterest = Math.floor(amount + Math.floor(amount * percent));
    const installmentAmountWithInterest = Math.floor(totalAmountWithInterest / months);

    const today = new Date();
    const tomorrow = JalaliMoment(today).add(1, 'day').startOf('day');
    const dueDate = JalaliMoment(tomorrow).add(currentIndex, 'months').endOf('day').toISOString();

    return {
      user: applicant,
      amount: installmentAmountWithInterest,
      leasingUserCredit: userCreditId,
      paid: false,
      paidDate: null,
      dueDate,
      paidAmount: 0,
      invoiceId: null,
    };
  }
}
