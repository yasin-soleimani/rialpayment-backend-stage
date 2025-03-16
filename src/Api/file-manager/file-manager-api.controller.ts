import { Controller, Get, Query, Req } from '@vision/common';
import { FileManagerApiService } from './file-manager-api.service';
import { GeneralService } from '../../Core/service/general.service';
import { FileManagerTypesEnum } from '../../Core/file-manager/enums/file-manager-types-enum';
import { FileManagerStatusEnum } from '../../Core/file-manager/enums/file-manager-status-enum';

@Controller('file-manager')
export class FileManagerApiController {
  constructor(
    private readonly fileManagerService: FileManagerApiService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  async getFilter(
    @Req() req,
    @Query() query: { group?: string; type: FileManagerTypesEnum; status: FileManagerStatusEnum; id: string }
  ) {
    const user = await this.generalService.getUserid(req);
    const page = await this.generalService.getPage(req);

    return this.fileManagerService.getFilter(user, page, query);
  }
}
