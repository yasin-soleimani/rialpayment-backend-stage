import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  successOpt,
  successOptWithPagination,
} from '@vision/common';
import { AppVersionsCoreService } from '../../Core/appVersion/app-versions.service';
import { UPLOAD_URI } from '../../__dir__';

@Injectable()
export class BackofficeAppVersionService {
  constructor(private readonly manageService: AppVersionsCoreService) {}

  async addNew(
    req,
    getInfo: { force: '1' | '0' | boolean; version: string | number; versionString: string }
  ): Promise<any> {
    let { force, version } = getInfo;
    console.log(getInfo);
    if (!version || isNaN(parseInt(version as string))) throw new BadRequestException();
    if (!req.files === null || !req.files.apk) throw new BadRequestException('فایل بارگذاری نشده است');
    const mime = this.checkMime(req.files.apk.mimetype);
    if (!mime) throw new BadRequestException('فایل بارگذاری نشده است');
    const imgx = req.files.apk;
    const img = 'apps/RialPayment-' + version + '.' + mime;
    force = force && force == '1' ? true : false;
    version = parseInt(version as string);

    const lastVersion = await this.manageService.getLast();
    if (version <= lastVersion.version)
      throw new BadRequestException('ورژن وارد شده از ورژن های ثبت شده قبلی قدیمی تر است');
    await imgx.mv(UPLOAD_URI + img, (err) => {
      if (err) throw new InternalServerErrorException();
    });

    const data = await this.manageService.newApp({
      version,
      fileName: img,
      versionString: getInfo.versionString,
      force,
      isMain: true,
    });
    if (!data) throw new InternalServerErrorException();
    return successOpt();
  }

  private checkMime(mimetype: string) {
    switch (mimetype) {
      case 'application/vnd.android.package-archive': {
        return 'apk';
      }
      default:
        return '';
    }
  }
}
