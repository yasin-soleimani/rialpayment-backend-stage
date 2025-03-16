import { Injectable, NotFoundException, successOptWithDataNoValidation } from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';
import { LeasingContractCoreService } from '../../Core/leasing-contract/leasing-contract.service';
import { LeasingRefCoreService } from '../../Core/leasing-ref/leasing-ref.service';
import { AddLeasingContractDto } from './dto/add-leasing-contract.dto';
import { GetLeasingContractQueryParams } from './dto/get-leasing-contract-query-params.dto';
import { LeasingContractUtilityService } from '../../Core/leasing-contract/services/leasing-contract-utility.service';

@Injectable()
export class LeasingContractService {
  constructor(
    private readonly leasingContractUtilityService: LeasingContractUtilityService,
    private readonly leasingContractCoreService: LeasingContractCoreService,
    private readonly leasingRefCoreService: LeasingRefCoreService
  ) {}

  async getContracts(userId: string, queryParams: GetLeasingContractQueryParams): Promise<any> {
    await this.leasingContractUtilityService.checkAcl(userId);
    const query = await this.leasingContractUtilityService.getLeasingContractsQueryBuilder(userId, queryParams);
    const data = await this.leasingContractCoreService.getByLeasingUser(query);
    return successOptWithDataNoValidation(data);
  }

  async addContract(userId: string, body: AddLeasingContractDto): Promise<any> {
    await this.leasingContractUtilityService.checkAcl(userId);
    await this.leasingContractUtilityService.checkIfLeasingAlreadyHasActiveContract(userId);
    await this.leasingContractUtilityService.validateAddLeasingContractDto(body);
    const normalizedDto = await this.leasingContractUtilityService.normalizeAddLeasingContractDto(userId, body);
    const result = await this.leasingContractCoreService.add(normalizedDto);
    return successOptWithDataNoValidation(result);
  }

  async extendContract(userId: string, contractId: string): Promise<any> {
    await this.leasingContractUtilityService.checkAcl(userId);
    await this.leasingContractUtilityService.checkIfLeasingAlreadyHasActiveContract(userId);
    const expiredContract = await this.leasingContractCoreService.getExpiredContractById(contractId);
    if (!expiredContract) throw new NotFoundException('این قرارداد هنوز منقضی نشده است');
    const extendedContractDto = await this.leasingContractUtilityService.generateNewContractData(expiredContract);
    const extendedContract = await this.leasingContractCoreService.add(extendedContractDto);
    return successOptWithDataNoValidation(extendedContract);
  }

  async getTheContract(userId: string, contractId: string): Promise<any> {
    await this.leasingContractUtilityService.checkAcl(userId);
    const data = await this.leasingContractCoreService.getById(contractId);
    return successOptWithDataNoValidation(data);
  }

  async getActiveLeasingRefs(userid: string): Promise<any> {
    await this.leasingContractUtilityService.checkAcl(userid);
    const data = await this.leasingRefCoreService.getActiveLeasingRefsByLeasingUser(userid);
    for (const item of data) {
      item.leasingUser.avatar = imageTransform(item.leasingUser.avatar);
    }
    return successOptWithDataNoValidation(data);
  }
}
