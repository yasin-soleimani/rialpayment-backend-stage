import { Injectable, Inject, successOptWithDataNoValidation, successOptWithPagination } from '@vision/common';
import { HistoryFilterDto } from 'src/Api/history/dto/filter.dto';
import { LogFilterQueryBuilder, logMakeResult, logMakeExcel } from '../func/filter-query-builder.func';

@Injectable()
export class LoggerCoreQueryBuilderService {
  constructor(@Inject('LoggerModel') private readonly loggerModel: any) {}

  async makeFilter(getInfo: HistoryFilterDto, userid: string, page: number): Promise<any> {
    const query = LogFilterQueryBuilder(getInfo, userid);
    const data = await this.loggerModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });

    const result = logMakeResult(data, userid);

    return successOptWithPagination(result);
  }

  async makeExcel(getInfo: HistoryFilterDto, userid: string): Promise<any> {
    const query = LogFilterQueryBuilder(getInfo, userid);
    const data = await this.loggerModel.find(query);

    return logMakeExcel(data, userid);
  }
}
