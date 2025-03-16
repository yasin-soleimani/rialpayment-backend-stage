import {
  Injectable,
  InternalServerErrorException,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { CreateLeasingOptionDto } from '../../Core/leasing-option/dto/create-leasing-option.dto';
import { LeasingOptionCoreService } from '../../Core/leasing-option/leasing-option.service';
import { LeasingOptionPatchAllowedTerminalsDto } from '../../Core/leasing-option/dto/patch-allowed-terminals.dto';
import { UpdateLeasingOptionDto } from '../../Core/leasing-option/dto/update-leasing-option.dto';
import { LeasingRefCoreService } from '../../Core/leasing-ref/leasing-ref.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { LeasingOptionUtilityService } from './services/leasing-option-utility.service';
import * as mongoose from 'mongoose';
import { MerchantShareService } from '../../Core/merchant/services/merchant-share.service';

@Injectable()
export class LeasingOptionService {
  constructor(
    private readonly leasingOptionUtilityService: LeasingOptionUtilityService,
    private readonly leasingOptionCoreService: LeasingOptionCoreService,
    private readonly leasingRefCoreService: LeasingRefCoreService,
    private readonly merchantTerminalsCoreService: MerchantCoreTerminalService,
    private readonly merchantShareService: MerchantShareService
  ) {}

  async getOptionsListByLeasingUser(userId: string, page: number): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    const result = await this.leasingOptionCoreService.getAllByLeasingUser(userId, page);
    if (!result) {
      throw new InternalServerErrorException('خطای سرور');
    }
    return successOptWithPagination(result);
  }

  async createOptionByLeasingUser(userId: string, body: CreateLeasingOptionDto): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    const contract = await this.leasingOptionUtilityService.checkIfLeasingHasActiveContract(userId);
    await this.leasingOptionUtilityService.checkIfLeasingHasDefinedAnyForm(userId);
    await this.leasingOptionUtilityService.validateCreateLeasingOptionDto(body, contract);
    const result = await this.leasingOptionCoreService.create(userId, body);

    if (!result) {
      throw new InternalServerErrorException('خطای سرور');
    }
    return successOptWithDataNoValidation(result);
  }

  async getTheOption(userId: string, id: string): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    const result = await this.leasingOptionCoreService.getById(id);
    if (!result) {
      throw new InternalServerErrorException('خطای سرور');
    }
    return successOptWithDataNoValidation(result);
  }

  async updateLeasingOption(userId: string, id: string, body: UpdateLeasingOptionDto): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    const normalizedDto = await this.leasingOptionUtilityService.normalizeUpdateLeasingOptionDto(body);
    const result = await this.leasingOptionCoreService.updateOption(id, normalizedDto);
    if (result) {
      return successOptWithDataNoValidation(result);
    } else {
      throw new InternalServerErrorException('خطای سرور');
    }
  }

  async patchAllowedTerminals(userId: string, id: string, body: LeasingOptionPatchAllowedTerminalsDto): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    await this.leasingOptionUtilityService.validateTerminalsObjectIds(body);
    const result = await this.leasingOptionCoreService.patchAllowedTerminals(id, body);
    if (result) {
      return successOptWithDataNoValidation(result);
    } else {
      throw new InternalServerErrorException('خطای سرور');
    }
  }

  async getAccessibleTerminals(userId: string): Promise<any> {
    await this.leasingOptionUtilityService.checkAcl(userId);
    const leasingRefData = await this.leasingRefCoreService.getByLeasingUser(userId);
    const clubUserId = leasingRefData ? leasingRefData.clubUser : '';
    if (!!clubUserId) {
      const shares = await this.merchantShareService.getSharesByToId(clubUserId);
      const array = [mongoose.Types.ObjectId(clubUserId), mongoose.Types.ObjectId(userId)];
      for (const share of shares) array.push(mongoose.Types.ObjectId(share.sharedMerchant as string));
      const data = await this.merchantTerminalsCoreService.getMerchantsAllTerminal(array, 1, true, false);
      return successOptWithDataNoValidation(data);
    }
    const terminals = await this.merchantTerminalsCoreService.getByClubUserOrLeasingUser(clubUserId, userId);

    return successOptWithDataNoValidation(terminals);
  }
}
