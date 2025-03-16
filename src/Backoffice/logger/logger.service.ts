import { Injectable } from '@vision/common';
import { BackofficeLoggerDto } from './dto/logger.dto';
import { LoggercoreService } from '../../Core/logger/loggercore.service';

@Injectable()
export class BackofficeLoggerService {
  constructor(private readonly loggerService: LoggercoreService) {}

  async getFilterList(getInfo: BackofficeLoggerDto): Promise<any> {}
}
