import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithDataNoValidation,
} from '@vision/common';
import { PnaUploadDocument } from '../../api/novin-arian.api';
import documentTypesValue from '../../const/document-types-value';
import { DocumentTypesEnum } from '../../enums/document-types-enum';
import { UPLOAD_URI } from '../../../../__dir__';

@Injectable()
export class MerchantPspCorePnaDocumentService {
  constructor(@Inject('MerchantPspDocumentModel') private readonly fileModel: any) {}

  async uploadImage(userId: string, customerId, type: number, documentType: DocumentTypesEnum, req): Promise<any> {
    const binary = Buffer.from(req.files.file.data).toString('base64');
    const mime = this.checkMime(req.files.file.mimetype);
    if (!mime) throw new BadRequestException('فایل ارسالی قابل قبول نمیباشد');
    try {
      const { AddFileResult } = await PnaUploadDocument({
        FileName: req.files.file.name,
        BinaryData: binary,
      });
      console.log('addfile:::::::', AddFileResult);
      const { attributes } = AddFileResult;

      if (attributes.Status == 'Successed') {
        console.log(attributes);
        const img = await this.upload(userId, req, mime);
        const file = await this.fileModel.create({
          merchant: customerId,
          status: true,
          user: userId,
          img: img,
          byte: binary,
          fileName: req.files.file.name,
          type: documentType,
          fileType: {
            name: documentTypesValue[type],
            type: type,
          },
          savedId: attributes.SavedID,
        });
        return successOptWithDataNoValidation(file);
      } else {
        throw new InternalServerErrorException();
      }
    } catch (e) {
      console.log('eeeeeeeeeeeeee:::::::::');
      console.log(e);
    }
  }

  async getList(userId: string): Promise<any> {
    return this.fileModel.find({ user: userId, status: true });
  }

  private async upload(userId: string, req, mime): Promise<any> {
    const avatar = req.files.file;
    // const img =  userid + '.' +  mime;
    const uuid = userId + new Date().getTime();
    const img = uuid + '.' + mime;
    await avatar.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });

    return img;
  }

  private checkMime(mimetype: string) {
    switch (mimetype) {
      case 'application/pdf': {
        return 'pdf';
      }
      case 'image/png': {
        return 'png';
      }
      case 'image/jpg': {
        return 'jpg';
      }
      case 'image/jpeg': {
        return 'jpeg';
      }
      default:
        '';
    }
  }
}
