import { faildOpt, Injectable, successOpt, successOptWithDataNoValidation } from '@vision/common';
import { imageTransform } from '@vision/common/transform/image.transform';
import { IdentifyCoreService } from '../../Core/useraccount/identify/identify.service';
import { IdentifyUploadImgApiService } from './services/upload.service';

@Injectable()
export class IdentifyApiService {
  constructor(
    private readonly identifyService: IdentifyCoreService,
    private readonly uploadImage: IdentifyUploadImgApiService
  ) {}

  async uploadData(getInfo, req, userid: string): Promise<any> {
    if (!req.files) return faildOpt();
    const field = req.files;
    const it = Object.keys(field);
    let counter = 0;
    let front, back;
    for (const info of it) {
      const img = await this.uploadImage.uploadImg(field[info], userid, info);
      if (info == 'ninfront') {
        front = img;
      }
      if (info == 'ninback') {
        back = img;
      }
      counter++;
    }
    if (counter < it.length) return faildOpt();
    await this.identifyService.addnew(userid, front, back, getInfo.nationalcode, getInfo.cardno);
    return successOpt();
  }

  async getLastByUserId(userid: string): Promise<any> {
    const data = await this.identifyService.getLastUploadWithRejectionStatus(userid);
    if (data && data.length > 0) {
      const firstItem = data[0];
      const rejects = firstItem.reject;

      let result: any = {};
      if (rejects.length > 0) {
        const lastReject = firstItem.reject[rejects.length - 1];
        result = {
          ...firstItem,
          ninfront: imageTransform(firstItem.ninfront),
          reject: lastReject,
          nationalcode: firstItem.nationalcode ?? '',
        };
      } else {
        result = {
          ...firstItem,
          ninfront: imageTransform(firstItem.ninfront),
          nationalcode: firstItem.nationalcode ?? '',
          reject: null,
        };
      }
      return successOptWithDataNoValidation(result);
    } else {
      return successOptWithDataNoValidation(null);
    }
  }
}
