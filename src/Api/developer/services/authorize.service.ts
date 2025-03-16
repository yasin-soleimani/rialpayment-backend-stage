import { Injectable, InternalServerErrorException, successOpt } from '@vision/common';
import { AuthorizeUserzCoreService } from '../../../Core/authorize/user/user.service';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import * as uniqid from 'uniqid';
import { DeveloperAuthorizeApiDto } from '../dto/authorize.dto';
import { UPLOAD_URI } from '../../../__dir__';
const uuidv1 = require('uuid/v1');

@Injectable()
export class DeveloperAuthorizeApiService {
  constructor(private readonly authUserService: AuthorizeUserzCoreService) {}

  async changeStatus(id: string, status: boolean): Promise<any> {
    return this.authUserService
      .changeStatus(id, status)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async submit(getInfo: DeveloperAuthorizeApiDto, req): Promise<any> {
    const count = await this.authUserService.getCount(getInfo.user);
    if (count >= 10) throw new UserCustomException('سقف تعداد مجاز پر شده است', false, 500);

    getInfo.logo = await this.upload(req);
    getInfo.ip = getInfo.ip.split(',');
    getInfo.type = 1;
    getInfo.apikey = uuidv1();

    return this.authUserService
      .submit(getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  async update(getInfo: DeveloperAuthorizeApiDto, req): Promise<any> {
    if (req.files && req.files.logo) {
      getInfo.logo = await this.upload(req);
    } else {
      delete getInfo.logo;
    }

    getInfo.type = 1;
    getInfo.ip = getInfo.ip.split(',');

    return this.authUserService
      .update(getInfo.id, getInfo)
      .then((res) => {
        if (!res) throw new InternalServerErrorException();

        return successOpt();
      })
      .catch((err) => {
        throw new InternalServerErrorException();
      });
  }

  private async upload(req): Promise<any> {
    const mime = this.checkMime(req.files.logo.mimetype);
    const avatar = req.files.logo;
    // const img =  userid + '.' +  mime;
    const uuid = uniqid();
    const img = uuid + '.' + mime;
    await avatar.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });

    return img;
  }

  checkFile(req) {
    if (!req.files.logo) throw new FillFieldsException();
  }

  checkMime(mimetype: string) {
    switch (mimetype) {
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
    }
  }
}
