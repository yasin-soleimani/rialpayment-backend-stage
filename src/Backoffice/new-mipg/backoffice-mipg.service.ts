import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOpt,
  successOptWithDataNoValidation,
  successOptWithPagination,
} from '@vision/common';
import { IpgCoreService } from '../../Core/ipg/ipgcore.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';
import { MipgCoreService } from '../../Core/mipg/mipg.service';
import { BackofficeMipgListFilterDto } from './dto/mipg-list-filter.dto';
import { PatchMipgDto } from './dto/patch-mipg.dto';

@Injectable()
export class BackofficeMipgService {
  constructor(
    private readonly merchantTerminalCoreService: MerchantCoreTerminalService,
    private readonly ipgCoreService: IpgCoreService,
    private readonly mipgCoreService: MipgCoreService
  ) {}

  async getMipgList(queryParams: BackofficeMipgListFilterDto): Promise<any> {
    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const searchParam = queryParams.q ?? '';

    const mipgsData = await this.mipgCoreService.searchInBackofficeMode(page, searchParam);
    if (!mipgsData) throw new NotFoundException('ترمنیال یافت نشد');

    return successOptWithPagination(mipgsData);
  }

  async getMipgByTerminalId(terminalId: string): Promise<any> {
    const id = Number(terminalId);
    if (Number.isNaN(id)) throw new BadRequestException('شناسه ترمینال صحیح نیست');
    const mipgsData = await this.mipgCoreService.getInfoByTerminalId(id);
    if (!mipgsData) throw new NotFoundException('ترمنیال یافت نشد');

    return successOptWithDataNoValidation(mipgsData);
  }

  async getMerchantTerminals(queryParams: BackofficeMipgListFilterDto): Promise<any> {
    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const searchParam = queryParams.q ?? '';

    const merchantTerminalsData = await this.merchantTerminalCoreService.searchAllTerminalsBackoffice(
      page,
      searchParam
    );
    if (!merchantTerminalsData) throw new NotFoundException('ترمنیال یافت نشد');

    return successOptWithPagination(merchantTerminalsData);
  }

  async patchMipg(patchMipgDto: PatchMipgDto): Promise<any> {
    return this.mipgCoreService.patchTerminalIntoMipg(patchMipgDto.mipg, patchMipgDto.merchantTerminal);
  }

  async getMipgTransactions(query: BackofficeMipgListFilterDto, terminalid: string): Promise<any> {
    const page = query.page ? parseInt(query.page) : 1;

    const terminalId = Number(terminalid);
    if (Number.isNaN(terminalId)) throw new BadRequestException('شناسه ترمینال صحیح نیست');

    const result = await this.ipgCoreService.getAllTransactionsByTerminalId(page, terminalId);
    return successOptWithPagination(result);
  }

  async changeMipgStatus(terminalid: string, status: boolean): Promise<any> {
    if (typeof status !== 'boolean') throw new BadRequestException('مقدار status صحیح نیست');
    const terminalId = Number(terminalid);
    if (Number.isNaN(terminalId)) throw new BadRequestException('شناسه ترمینال صحیح نیست');

    const result = await this.mipgCoreService.changeTerminalStatusBackofficeMode(terminalId, status);
    if (!result) throw new InternalServerErrorException('عملیات با خطا مواجه شده است');
    return successOpt();
  }
}
