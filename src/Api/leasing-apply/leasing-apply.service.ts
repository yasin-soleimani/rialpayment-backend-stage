import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { UpdateLeasingApplyDto } from '../../Core/leasing-apply/dto/update-leasing-apply.dto';
import { PossibleDeviceTypes } from '../../utils/types.util';
import { GetApplyListForLeasingQueryParams } from './dto/get-apply-list-for-leasing-query-params.dto';
import { LeasingApplyClubService } from './services/leasing-apply-club.service';
import { LeasingApplyCommonService } from './services/leasing-apply-common.service';
import { LeasingApplyUtilityService } from './services/leasing-apply-utility.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { LeasingApplyFormDto } from './dto/leasing-apply-form.dto';
import { LeasingFormCoreService } from '../../Core/leasing-form/leasing-form.service';
import { UpdateLeasingApplyForm } from './dto/update-leasing-apply-form.dto';
import { UserService } from '../../Core/useraccount/user/user.service';
import { LeasingApplyIpgService } from './services/leasing-apply-ipg.service';
import { LeasingApplyStatusEnum } from '../../Core/leasing-apply/enums/leasing-apply-status.enum';
import { LeasingOption } from '../../Core/leasing-option/interfaces/leasing-option.interface';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { ClubCoreService } from '../../Core/customerclub/club.service';

@Injectable()
export class LeasingApplyService {
  constructor(
    private readonly leasingApplyUtilityService: LeasingApplyUtilityService,
    private readonly leasingApplyClubService: LeasingApplyClubService,
    private readonly leasingApplyCommonService: LeasingApplyCommonService,
    private readonly leasingFormCoreService: LeasingFormCoreService,
    private readonly leasingApplyIpgService: LeasingApplyIpgService,
    private readonly userCoreService: UserService,
    private readonly customerClubService: ClubCoreService
  ) {}

  async getLeasingList(userId: any, devicetype: PossibleDeviceTypes, referer: string): Promise<any> {
    await this.leasingApplyUtilityService.checkUser(userId);

    switch (devicetype) {
      case 'mobile':
      case 'mobile_google':
      case 'web':
      case 'pwa':
        return await this.getLeasingByUserRef(userId);
      default:
        throw new InternalServerErrorException('نسخه اپلیکیشن شناسایی نشد.');
    }
  }

  async getTheLeasingApplyForUser(userId: any, applyId: string): Promise<any> {
    await this.leasingApplyUtilityService.checkUser(userId);
    const data = await this.leasingApplyCommonService.getTheApplyForUser(applyId);
    if (data.length > 0) {
      return successOptWithDataNoValidation(data[0]);
    } else {
      throw new UserCustomException('موردی یافت نشد');
    }
  }

  async getTheLeasingApplyForLeasing(userId: string, applyId: string): Promise<any> {
    await this.leasingApplyUtilityService.checkLeasingAcl(userId);
    const data = await this.leasingApplyCommonService.getTheApply(applyId);
    return successOptWithDataNoValidation(data[0]);
  }

  async updateByLeasing(leasingUserId: string, leasingApplyId: string, dto: UpdateLeasingApplyDto): Promise<any> {
    await this.leasingApplyUtilityService.checkLeasingAcl(leasingUserId);
    await this.leasingApplyUtilityService.validateUpdateApplyByLeasingDto(dto);
    const data = await this.leasingApplyCommonService.updateApplyByLeasing(leasingApplyId, dto);
    if (!data) throw new InternalServerErrorException();
    if (data && data.applicant) {
      const userData = await this.userCoreService.getInfoByUserid(data.applicant);
      if (userData && userData.mobile) {
        let message = '';
        switch (dto.status) {
          case LeasingApplyStatusEnum.ACCEPTED_BY_LEASING:
            message = `درخواست وام شما توسط سرمایه گذار تایید شد! پس از تایید نهایی مبلغ برای شما اعمال خواهد شد`;
            break;
          case LeasingApplyStatusEnum.PENDING:
            message = `وضعیت درخواست وام شما توسط سرمایه گذار به در حال بررسی تغییر یافت!`;
            break;
          case LeasingApplyStatusEnum.DECLINED:
            message = `درخواست وام شما به دلیل "${dto.message}" توسط سرمایه گذار رد شد`;
            break;
        }
        if (message)
          try {
            await SendAsanakSms(
              process.env.ASANAK_USERNAME,
              process.env.ASANAK_PASSWORD,
              process.env.ASANAK_NUMBER,
              '0' + userData.mobile,
              message
            );
          } catch (e) {}
      }
      const leasingUserData = await this.userCoreService.getInfoByUserid(data.applicant);
      if (leasingUserData.ref) {
        const club = await this.customerClubService.getClubInfoByOwner(leasingUserData.ref);
        if (club && club.user) {
          const leasingClubUser = await this.userCoreService.getInfoByUserid(club.user);
          if (userData && leasingClubUser && leasingClubUser.mobile)
            SendAsanakSms(
              process.env.ASANAK_USERNAME,
              process.env.ASANAK_PASSWORD,
              process.env.ASANAK_NUMBER,
              '0' + leasingClubUser.mobile,
              `درخواست وام کاربر ${userData.fullname ?? userData.mobile} توسط سرمایه گذار به ${
                dto.status === LeasingApplyStatusEnum.ACCEPTED_BY_LEASING
                  ? 'تایید شده'
                  : dto.status === LeasingApplyStatusEnum.DECLINED
                  ? 'رد شده'
                  : 'در حال بررسی'
              } تغییر یافت.`
            )
              .then(() => console.log('sms status to club user sent!'))
              .catch();
        }
      }
    }
    return successOptWithDataNoValidation(data);
  }

  async updateLeasingApplyByApplicant(
    userId: any,
    leasingApplyId: string,
    req: any,
    body: UpdateLeasingApplyForm
  ): Promise<any> {
    try {
      const leasingApply = await this.leasingApplyUtilityService.checkIfLeasingApplyIsUpdatable(leasingApplyId);
      const leasingForms = await this.leasingFormCoreService.getByLeasingUser(leasingApply.leasingUser);
      const normalizedDto = await this.leasingApplyUtilityService.normalizeUpdateLeasingApplyByApplicantDto(
        req,
        body,
        leasingForms
      );
      await this.leasingApplyCommonService.updateApplicationByApplicant(userId, leasingApplyId, normalizedDto);
      return successOpt();
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getApplyListForLeasing(
    userId: any,
    page: number,
    queryParams: GetApplyListForLeasingQueryParams
  ): Promise<any> {
    await this.leasingApplyUtilityService.checkLeasingAcl(userId);
    const aggregate = await this.leasingApplyUtilityService.getApplyListForLeasingQueryBuilder(userId, queryParams);
    const data = await this.leasingApplyCommonService.getApplyListForLeasing(page, aggregate);
    return successOptWithPagination(data);
  }

  async getTheLeasingOptions(userId: any, leasingRefId: string): Promise<any> {
    await this.leasingApplyUtilityService.checkUser(userId);
    const leasingRef = await this.leasingApplyCommonService.getLeasingRefById(leasingRefId);
    const invalidContract = await this.leasingApplyUtilityService.checkIfLeasingContractIsInvalid(leasingRefId);
    console.log('invalid contract: ', invalidContract);
    if (invalidContract) throw new BadRequestException('سرمایه‌گذار در حال حاضر قادر به ارائه تسهیلات نمی‌باشد');
    const data = await this.leasingApplyCommonService.getTheLeasingOptions(leasingRef.leasingUser);
    return successOptWithDataNoValidation(data);
  }

  async apply(
    req: any,
    userId: string,
    body: LeasingApplyFormDto,
    leasingUser: string,
    leasingOption: string
  ): Promise<any> {
    await this.leasingApplyUtilityService.checkUser(userId);
    const leasingForms = await this.leasingFormCoreService.getByLeasingUser(leasingUser);
    await this.leasingApplyUtilityService.validateLeasingApplyDto(body, req, leasingForms, leasingUser, leasingOption);
    await this.leasingApplyUtilityService.checkIfUserAlreadyHasPendingRequest(userId, leasingUser);
    const normalizedDto = await this.leasingApplyUtilityService.normalizeLeasingApplyFormLoanDto(
      body,
      req,
      userId,
      leasingForms,
      leasingUser,
      leasingOption
    );

    console.log({ normalizedDto });
    const savedDocument = await this.leasingApplyCommonService.addNewApplication(normalizedDto);
    if (!savedDocument) throw new InternalServerErrorException();
    const leasingUserData = await this.userCoreService.getInfoByUserid(leasingUser);
    if (leasingUserData && leasingUserData.mobile) {
      SendAsanakSms(
        process.env.ASANAK_USERNAME,
        process.env.ASANAK_PASSWORD,
        process.env.ASANAK_NUMBER,
        '0' + leasingUserData.mobile,
        ` یک درخواست وام جدید ثبت شده است! لطفا برای بررسی به پورتال ریال پیمنت مراجعه نمایید.`
      )
        .then(async () => {
          console.log('sms to leasing user sent!');
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
                  ` یک درخواست وام جدید ثبت شده است! لطفا برای بررسی به پورتال ریال پیمنت مراجعه نمایید.`
                )
                  .then(() => console.log('sms to club user sent!'))
                  .catch();
            }
          }
        })
        .catch();
    }

    return successOpt();
  }

  async getUserApplyList(userId: string): Promise<any> {
    const data = await this.leasingApplyCommonService.getUserApplyList(userId);
    return successOptWithDataNoValidation(data);
  }

  async getLeasingByUserRef(userId: any): Promise<any> {
    try {
      const user = await this.userCoreService.getInfoByUserid(userId);
      const ref = user.ref;
      const clubData = await this.leasingApplyUtilityService.getClubPwaDataByClubUser(ref);
      const data = await this.leasingApplyClubService.getClubLeasingRefs(clubData, ref);
      return successOptWithDataNoValidation(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async payApplicationAmount(userId: any, applyId: string): Promise<any> {
    const apply = await this.leasingApplyUtilityService.getApplyById(applyId);
    if (apply.status !== LeasingApplyStatusEnum.ACCEPTED_BY_LEASING)
      throw new BadRequestException('پرداخت فقط پس از تأیید می‌تواند انجام شود');
    const option = apply.leasingOption as LeasingOption;
    const payload = {
      _id: apply._id,
      userId,
    };
    const data = await this.leasingApplyIpgService.makePay(
      process.env.LECREDIT_APPLY_PAY,
      option.amount,
      process.env.LECREDIT_APPLY_PAY_IPG_CALLBACK_SERVER,
      payload
    );
    if (!data.invoiceid) throw new UserCustomException('پرداخت با خطا مواجه شده است');
    await this.leasingApplyUtilityService.setInvoiceId(applyId, data.invoiceid);
    console.log('leaisngApply Ipg:::', data.invoiceid);

    return successOptWithDataNoValidation(data.invoiceid);
  }

  async getUserCreditsForLeasing(userId: string): Promise<any> {
    const data = await this.leasingApplyUtilityService.getUserCreditsForLeasing(userId);
    return successOptWithDataNoValidation(data);
  }

  async getInstallmentsForLeasing(userCreditId: string): Promise<any> {
    const data = await this.leasingApplyUtilityService.getInstallmentsForLeasing(userCreditId);
    return successOptWithDataNoValidation(data);
  }
}
