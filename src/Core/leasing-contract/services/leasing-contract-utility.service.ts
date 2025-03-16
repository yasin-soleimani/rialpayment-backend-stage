import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@vision/common';
import {isNil} from '@vision/common/utils/shared.utils';
import {AclCoreService} from '../../acl/acl.service';
import {LeasingContract, LeasingContractDocument} from '../interfaces/leasing-contract.interface';
import {AddLeasingContractDto} from '../../../Api/leasing-contract/dto/add-leasing-contract.dto';
import {LeasingInvestmentPeriodEnum} from '../enums/leasing-investment-period.enum';
import * as moment from 'jalali-moment';
import {LeasingContractCoreService} from '../leasing-contract.service';
import {GetLeasingContractQueryParams} from '../../../Api/leasing-contract/dto/get-leasing-contract-query-params.dto';
import {FilterQuery} from 'mongoose';
import {LeasingContractStatusEnum} from '../enums/leasing-contract-status.enum';

@Injectable()
export class LeasingContractUtilityService {
  constructor(
    private readonly aclCoreService: AclCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService
  ) {}

  async getLeasingContractsQueryBuilder(
    userId: string,
    queryParams: GetLeasingContractQueryParams
  ): Promise<FilterQuery<LeasingContractDocument>> {
    let query: FilterQuery<LeasingContractDocument> = { leasingUser: userId, deleted: false };
    const now = new Date();
    if (queryParams) {
      // check requested contract status
      switch (queryParams.status) {
        case 'pending':
          query = { ...query, status: LeasingContractStatusEnum.PENDING };
          break;
        case 'expired':
          query = { ...query, expiresAt: { $lte: now } };
          break;
        case 'active':
          query = { ...query, expiresAt: { $gt: now }, status: LeasingContractStatusEnum.ACCEPTED };
          break;
        case 'all':
          break;
        default:
          query = { ...query, expiresAt: { $gt: now } };
          break;
      }
    }

    return query;
  }

  async checkAcl(userId: string): Promise<void> {
    const acl = await this.aclCoreService.getAclUSer(userId);
    if (!acl || !acl.leasing) throw new ForbiddenException('شما به این قسمت دسترسی ندارید');
  }

  async validateAddLeasingContractDto(body: AddLeasingContractDto): Promise<void> {
    if (isNil(body)) throw new BadRequestException('تمامی فیلد‌ها را پر کنید');
    if (isNil(body.title) || body.title === '') throw new BadRequestException('عنوان اجباریست');
    if (body.title.length < 5) throw new BadRequestException('عنوان نباید کمتر از 5 کاراکتر باشد');
    if (body.title.length > 64) throw new BadRequestException('عنوان نباید بیشتر از 64 کاراکتر باشد');
    if (isNil(body.investmentAmount)) throw new BadRequestException('مبلغ سرمایه‌گذاری اجباریست');
    if (isNil(body.investmentPeriod)) throw new BadRequestException('مدت قرارداد سرمایه‌گذاری اجباریست');
    if (isNil(body.startsAt)) throw new BadRequestException('تاریخ شروع قرارداد الزامیست');
    if (typeof body.startsAt !== 'number')
      throw new BadRequestException('تاریخ شروع قرارداد باید به صورت unix timestampt و به میلی‌ثانیه ارسال گردد');
    if (typeof body.investmentAmount !== 'number' || Number.isNaN(Number(body.investmentAmount)))
      throw new BadRequestException('مبلغ سرمایه‌گذاری باید عدد باشد');
    if (body.description) {
      if (body.description.length > 1000) throw new BadRequestException('توضیحات نباید بیشتر از 1000 کاراکتر باشد');
    }
  }

  async normalizeAddLeasingContractDto(userId: string, body: AddLeasingContractDto): Promise<LeasingContract> {
    let expiresAt = await this.calculateContractExpireDate(body.startsAt, body.investmentPeriod);

    return {
      deleted: false,
      title: body.title,
      description: body.description,
      investmentAmount: body.investmentAmount,
      startsAt: new Date(body.startsAt),
      leasingUser: userId,
      remain: body.investmentAmount,
      investmentPeriod: body.investmentPeriod,
      expiresAt: expiresAt,
      status: LeasingContractStatusEnum.PENDING,
      leasingRef: body.leasingRef,
    };
  }

  async generateNewContractData(expiredContract: LeasingContract): Promise<LeasingContract> {
    const newStartsAtTimestamp = moment().locale('en').add(1, 'day').startOf('day').unix() * 1000;
    const newExpiresAt = await this.calculateContractExpireDate(newStartsAtTimestamp, expiredContract.investmentPeriod);
    const newStartsAtDate = new Date(newStartsAtTimestamp);
    return {
      deleted: false,
      title: expiredContract.title,
      description: expiredContract.description,
      investmentAmount: expiredContract.investmentAmount,
      startsAt: newStartsAtDate,
      leasingUser: expiredContract.leasingUser,
      remain: expiredContract.investmentAmount,
      investmentPeriod: expiredContract.investmentPeriod,
      expiresAt: newExpiresAt,
      status: LeasingContractStatusEnum.PENDING,
      leasingRef: expiredContract.leasingRef,
    };
  }

  async checkIfLeasingAlreadyHasActiveContract(userId: string): Promise<void> {
    const activeContract = await this.leasingContractCoreService.findCurrentlyActiveContractByLeasingUser(userId);
    if (activeContract) throw new NotFoundException('شما هنوز یک قرارداد فعال  یا در دست بررسی دارید');
    return;
  }

  private async calculateContractExpireDate(
    startsAt: number,
    investmentPeriod: LeasingInvestmentPeriodEnum
  ): Promise<any> {
    const startsAtDate = new Date(startsAt);
    switch (investmentPeriod) {
      case LeasingInvestmentPeriodEnum.YEARLY:
        return moment(startsAtDate).locale('en').add(12, 'month').endOf('day');

      case LeasingInvestmentPeriodEnum.EVERY_SIX_MONTH:
        return moment(startsAtDate).locale('en').add(6, 'month').endOf('day');

      case LeasingInvestmentPeriodEnum.SEASONAL:
        return moment(startsAtDate).locale('en').add(3, 'month').endOf('day');

      case LeasingInvestmentPeriodEnum.MONTHLY:
        return moment(startsAtDate).locale('en').add(1, 'month').endOf('day');

      default:
        return moment(startsAtDate).locale('en').add(12, 'month').endOf('day');
    }
  }
}
