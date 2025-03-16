import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  successOptWithDataNoValidation,
} from '@vision/common';
import { BasketShopCoreService } from '../../Core/basket/shop/service/shop.service';
import { isEmpty } from '@vision/common/utils/shared.utils';
import * as request from 'request';
import { SessionService } from '../../Core/session/session.service';

@Injectable()
export class DownloadService {
  constructor(private readonly shopService: BasketShopCoreService, private readonly sessionService: SessionService) {}

  async downloadShop(userid, shopref, productid, session): Promise<any> {
    if (isEmpty(shopref) || isEmpty(productid)) throw new InternalServerErrorException();

    const shopInfo = await this.shopService.getShopDetailByUserid(userid, shopref);
    if (!shopInfo) throw new NotFoundException();

    let downloadLink;

    for (const info of shopInfo.basket) {
      if (info.id._id == productid) {
        downloadLink = info.id.link;
      }
    }

    if (isEmpty(downloadLink)) throw new InternalServerErrorException();

    const now = new Date().getTime();
    session['downloadinfo'] = {
      downloadLink: downloadLink,
    };
    return successOptWithDataNoValidation('https://core-backend.rialpayment.ir/v1/download/link/' + session.id);
  }

  async getLink(id, session, res): Promise<any> {
    const data = await this.sessionService.getStatusById(id);
    if (!data) throw new NotFoundException();

    const parse = JSON.parse(data.session);
    console.log(parse, 'parse');
    request
      .get(parse.downloadinfo.downloadLink)
      .on('response', function (response) {
        console.log(response.statusCode); // 200
        console.log(response.headers['content-type']); // 'image/png'
      })
      .pipe(res);
  }
}
