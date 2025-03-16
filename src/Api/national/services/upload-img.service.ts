import { Injectable, InternalServerErrorException } from '@vision/common';
import * as uniqid from 'uniqid';
import { UPLOAD_URI } from '../../../__dir__';

@Injectable()
export class NationalUploadImgApiService {
  constructor() {}

  async uploadImg(file): Promise<any> {
    const mime = this.checkMime(file.mimetype);
    const uuid = uniqid() + new Date().getTime();
    const img = 'Docs-' + uuid + '.' + mime;
    await file.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });
    return img;
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
      case 'application/pdf': {
        return 'pdf';
      }
    }
  }
}
