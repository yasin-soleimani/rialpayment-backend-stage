import { Injectable } from '@vision/common';
import { FilterQuery } from 'mongoose';
import { MerchantTerminalPosInfoDocument } from '../../Core/merchant/interfaces/merchant-terminal-pos-info.interface';
import { MerchantTerminalPosInfoService } from '../../Core/merchant/services/merchant-terminal-pos-info.service';
import { PosGetAllQueryDto } from './dto/post-get-all-query.dto';
import { successOptWithPagination, successOpt, successOptWithDataNoValidation } from '@vision/common/messages';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { InternalServerErrorException } from '@vision/common/exceptions/internal-server-error.exception';
import { AddPosDto } from './dto/add-pos.dto';
import { ConnectPosToTerminalDto } from './dto/connect-pos-to-terminal.dto';
import { UpdatePosDto } from './dto/update-pos.dto';
import { UserService } from '../../Core/useraccount/user/user.service';
import { MerchantTerminalPosInfoHistoryService } from '../../Core/merchant/services/merchant-terminal-pos-info-history.service';
import { MerchantCoreTerminalService } from '../../Core/merchant/services/merchant-terminal.service';

@Injectable()
export class BackofficePosManagementService {
  constructor(
    private readonly posCoreService: MerchantTerminalPosInfoService,
    private readonly terminalCoreService: MerchantCoreTerminalService,
    private readonly posHistoryCoreService: MerchantTerminalPosInfoHistoryService,
    private readonly userCoreService: UserService
  ) {}

  async getAll(page: any, queryParams: PosGetAllQueryDto): Promise<any> {
    const data = await this.posCoreService.getAll(page, queryParams.q);
    return successOptWithPagination(data);
  }

  async addNewPos(data: AddPosDto): Promise<any> {
    if (!data) throw new UserCustomException('تمامی فیلد‌ها را پر کنید');
    if (!data.modelname) throw new UserCustomException('مدل دستگاه الزامیست');
    if (!data.serial) throw new UserCustomException('شماره سریال دستگاه الزامیست');
    if (!data.mac) throw new UserCustomException('شناسه دستگاه الزامیست');

    const result = await this.posCoreService.create(data);
    return successOpt();
  }

  async connectToTerminal(id: string, body: ConnectPosToTerminalDto, userId: string): Promise<any> {
    if (!body) throw new UserCustomException('تمامی فیلد‌ها را پر کنید');
    if (!body.terminal) throw new UserCustomException('انتخاب ترمینال الزامیست');
    const posWithDesiredTerminalData = await this.posCoreService.getPopulatedInfoByTerminal(body.terminal);
    if (posWithDesiredTerminalData)
      throw new UserCustomException(
        `ترمینال ${posWithDesiredTerminalData?.terminal?.title} در حال حاضر به دستگاه ${posWithDesiredTerminalData.serial} متصل است`
      );
    const data = await this.posCoreService.connectToTerminal(id, body.terminal);
    if (!data) throw new InternalServerErrorException('خطای سرور');

    const user = await this.userCoreService.getInfoByUserid(userId);
    const terminal = await this.terminalCoreService.getInfoByID(body.terminal);
    const message = `دستگاه ${data.serial} توسط ${user.fullname} (${user.mobile}) به ترمینال ${terminal.title} (${terminal.terminalid}) متصل شد`;
    const dto = {
      mac: data.mac,
      serial: data.serial,
      modelname: data.modelname,
    };
    await this.posHistoryCoreService.create(dto, userId, terminal._id, message);

    return successOpt();
  }

  async updatePos(posId: string, body: UpdatePosDto): Promise<any> {
    const data = await this.posCoreService.update(posId, body);
    if (!data) throw new InternalServerErrorException('خطای سرور');
    return successOpt();
  }

  async getById(posId: string): Promise<any> {
    const data = await this.posCoreService.getById(posId);
    if (!data) throw new UserCustomException('دستگاه یافت نشد');
    return successOptWithDataNoValidation(data);
  }

  async disconnectFromTerminal(posId: string, userId: string, body: { terminal: string }): Promise<any> {
    if (!body || !body.terminal) throw new UserCustomException('تمامی فیلد‌ها را پرکنید');

    const data = await this.posCoreService.disconnectFromTerminal(posId, body.terminal);
    if (!data) throw new InternalServerErrorException('خطای سرور');

    const terminal = await this.terminalCoreService.getInfoByID(body.terminal);
    const user = await this.userCoreService.getInfoByUserid(userId);

    if (terminal) {
      const message = `دستگاه ${data.serial} توسط ${user.fullname} (${user.mobile}) از ترمینال ${terminal.title} (${terminal.terminalid}) تخلیه شد`;
      const dto = {
        mac: data.mac,
        serial: data.serial,
        modelname: data.modelname,
      };
      await this.posHistoryCoreService.create(dto, userId, terminal._id, message);
    }

    return successOpt();
  }

  async getPosHistory(posId: string): Promise<any> {
    const posInfo = await this.posCoreService.getById(posId);
    if (!posInfo) throw new UserCustomException('دستگاه یافت نشد');
    const { serial, modelname, mac } = posInfo;
    const data = await this.posHistoryCoreService.getInfo(serial, modelname, mac);
    return successOptWithDataNoValidation(data);
  }

  async getAllHistories(page: any, queryParams: PosGetAllQueryDto): Promise<any> {
    const data = await this.posHistoryCoreService.getAll(page, queryParams.q);
    return successOptWithPagination(data);
  }
}
