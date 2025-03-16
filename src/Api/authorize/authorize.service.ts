import { Injectable, successOptWithDataNoValidation, InternalServerErrorException, successOpt } from '@vision/common';
import { AuthorizeClientCoreService } from '../../Core/authorize/client/client.service';
import { AuthorizeApiDto } from './dto/authorize.dto';
import { authorizeApiModel } from './func/model.func';

@Injectable()
export class AuthorizeApiService {
  constructor(private readonly authClientService: AuthorizeClientCoreService) {}

  async getList(userid: string): Promise<any> {
    const data = await this.authClientService.getListByUserid(userid);
    return successOptWithDataNoValidation(authorizeApiModel(data));
  }

  async udpate(getInfo: AuthorizeApiDto, userid: string): Promise<any> {
    return this.authClientService
      .updateByUseridAndId(userid, getInfo.id, getInfo.wallet, getInfo.maxbuy)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async changeStatus(userid: string, id: string): Promise<any> {
    return this.authClientService
      .changeStatus(userid, id, false)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();
        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }
}
