import { Injectable, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { AclCoreService } from '../../Core/acl/acl.service';
import { LeasingRefStatusEnum } from '../../Core/leasing-ref/enums/leasing-ref-status.enum';
import { LeasingRefCoreService } from '../../Core/leasing-ref/leasing-ref.service';
import { GetAllLeasingRefsFilters } from './dto/leasing-ref-filters.dto';
import { UpdateLeasingRefStatusDto } from './dto/update-leasing-ref-status.dto';
import { BackofficeLeasingRefQueryBuilderService } from './utils/leasing-ref-query-builders.service';
import { BackofficeLeasingRefValidatorsService } from './utils/leasing-ref-validators.service';
import { LeasingContractCoreService } from '../../Core/leasing-contract/leasing-contract.service';
import { LeasingContractStatusEnum } from '../../Core/leasing-contract/enums/leasing-contract-status.enum';

@Injectable()
export class BackofficeLeasingRefService {
  constructor(
    private readonly leasingRefCoreService: LeasingRefCoreService,
    private readonly leasingContractCoreService: LeasingContractCoreService,
    private readonly queryBuilders: BackofficeLeasingRefQueryBuilderService,
    private readonly validators: BackofficeLeasingRefValidatorsService,
    private readonly aclCoreService: AclCoreService
  ) {}

  async getAllLeasingRefs(page: number, filters: GetAllLeasingRefsFilters): Promise<any> {
    await this.validators.validateFilters(filters);
    const query = await this.queryBuilders.getAllLeasingRefQueryBuilders(filters);
    const data = await this.leasingRefCoreService.getAll(page, query);
    return successOptWithPagination(data);
  }

  async updateLeasingRefStatus(leasingRefId: string, userid: string, body: UpdateLeasingRefStatusDto): Promise<any> {
    await this.validators.validateUpdateLeasingRefStatusDto(body);
    const data = await this.leasingRefCoreService.updateLeasingRefStatus(
      leasingRefId,
      userid,
      body.status,
      body.message
    );
    if (body.status === LeasingRefStatusEnum.ACCEPTED) {
      await this.updateLeasingUserAcl(data.leasingUser);
    }
    return successOptWithDataNoValidation(data);
  }

  private updateLeasingUserAcl(leasingUser: any): Promise<void> {
    return this.aclCoreService.enableLeasingPermission(leasingUser);
  }

  async getLeasingContracts(leasingRefId: string): Promise<any> {
    const data = await this.leasingContractCoreService.getByLeasingRef(leasingRefId);
    return successOptWithDataNoValidation(data);
  }

  async updateTheContract(
    contractId: string,
    body: { status: LeasingContractStatusEnum }
  ): Promise<any> {
    const data = await this.leasingContractCoreService.update(contractId, body);
    return successOptWithDataNoValidation(data);
  }
}
