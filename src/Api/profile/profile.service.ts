import { BadRequestException, Injectable, InternalServerErrorException } from '@vision/common';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import * as uniqid from 'uniqid';
import { UPLOAD_URI } from '../../__dir__';
@Injectable()
export class ProfileService {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  async uploadAvatar(req, userid): Promise<any> {
    this.checkFile(req);
    const mime = this.checkMime(req.files.avatar.mimetype);
    const avatar = req.files.avatar;
    const uuid = uniqid();
    const img = uuid + '.' + mime;
    await avatar.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });
    this.userService.findAndUpdateAvatar(userid, img);
    return this.successOpt(img);
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

  checkFile(req) {
    if (!req.files.avatar) throw new FillFieldsException();
  }

  successOpt(url: string) {
    return {
      success: true,
      status: 200,
      message: process.env.SITE_URL + url,
    };
  }
}
