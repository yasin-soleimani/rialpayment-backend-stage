import * as soap from 'soap';
import { isEmpty } from '@vision/common/utils/shared.utils';
import axios, { AxiosInstance } from 'axios';
import * as jwt from 'jsonwebtoken';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';
import * as https from 'https';
import { faildOpt, Injectable } from '@vision/common';
import { format } from '@vision/common/constants/rahyab.const';
import { uniCode } from '@vision/common/utils/unicode.util';
import * as req from 'request';
import { base64ImageUpload } from '@vision/common/utils/img-base64.util';
import * as fs from 'fs';
import { promisify } from 'util';
import { FillFieldsException } from '@vision/common/exceptions/fill-fields.exception';
import { SendAsanakSms } from '@vision/common/notify/sms.util';
import { TokenService } from '../useraccount/token/token.service';
import { getIp } from '../../Guard/ip.decoration';
import { UPLOAD_URI } from '../../__dir__';

@Injectable()
export class GeneralService {
  private AsanPardakhtClient: AxiosInstance;
  private SMSRahyab: AxiosInstance;
  private userId = 6051;
  private password = 'IRDC@Service#110';

  constructor(private readonly tokenService: TokenService) {
    this.SMSRahyab = axios.create({
      baseURL: 'http://rialpayment.ir/',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    this.AsanPardakhtClient = axios.create({
      baseURL: 'https://91.232.66.44:7010/tds/rest/',
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  async getPage(req): Promise<any> {
    if (isEmpty(req.header('page'))) {
      return 1;
    } else {
      return req.header('page');
    }
  }

  async getPageFromZero(req): Promise<any> {
    if (isEmpty(req.header('page')) || isNaN(parseInt(req.header('page')))) {
      return 0;
    } else {
      return parseInt(req.header('page'));
    }
  }

  async getPageLimit(req): Promise<any> {
    if (isEmpty(req.header('limit')) || isNaN(parseInt(req.header('limit')))) {
      return 0;
    } else {
      return parseInt(req.header('limit'));
    }
  }

  async getBankId(req): Promise<any> {
    if (isEmpty(req.header('bankId')) || isNaN(parseInt(req.header('bankId')))) {
      return 0;
    } else {
      return parseInt(req.header('bankId'));
    }
  }

  async getCategory(req): Promise<any> {
    if (isEmpty(req.header('category'))) {
      return 'All';
    } else {
      return req.header('category');
    }
  }

  async getCategorySlug(req): Promise<any> {
    if (isEmpty(req.header('categoryslug'))) {
      return '';
    } else {
      return req.header('categoryslug');
    }
  }

  async getCategoryParent(req): Promise<any> {
    if (isEmpty(req.header('parent'))) {
      return '';
    } else {
      return req.header('parent');
    }
  }

  async getMerchantCode(req): Promise<any> {
    if (isEmpty(req.header('merchantcode'))) {
      return 1;
    } else {
      return req.header('merchantcode');
    }
  }

  async getTerminalid(req): Promise<any> {
    if (isEmpty(req.header('terminalid'))) {
      return 1;
    } else {
      return req.header('terminalid');
    }
  }

  async getCardno(req): Promise<any> {
    if (isEmpty(req.header('cardno'))) {
      return null;
    } else {
      return req.header('cardno');
    }
  }

  async getNationalcode(req): Promise<any> {
    if (isEmpty(req.header('nationalcode'))) {
      return null;
    } else {
      return req.header('nationalcode');
    }
  }

  async getPID(req): Promise<any> {
    if (isEmpty(req.header('pid'))) {
      return 0;
    } else {
      return req.header('pid');
    }
  }

  async getType(req): Promise<any> {
    if (isEmpty(req.header('type'))) {
      return null;
    } else {
      return req.header('type');
    }
  }

  async getID(req): Promise<any> {
    if (isEmpty(req.header('id'))) {
      return 0;
    } else {
      return req.header('id');
    }
  }

  async getNickname(req): Promise<any> {
    if (isEmpty(req.header('nickname'))) {
      return null;
    } else {
      return req.header('nickname');
    }
  }

  async getAccountNo(req): Promise<any> {
    if (isEmpty(req.header('accountno'))) {
      return null;
    } else {
      return req.header('accountno');
    }
  }

  async getGID(req): Promise<any> {
    if (isEmpty(req.header('gid'))) {
      return 0;
    } else {
      return req.header('gid');
    }
  }

  async getUserid(req): Promise<any> {
    if (isEmpty(req.header('Authorization')))
      throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);
    const token = req.header('Authorization').split(' ');
    try {
      const userRequest = getIp(req);
      const data = await this.tokenService.validate(token[1]);

      // if (!data) throw new UserCustomException('توکن نامعتبر ! مجددا وارد شوید', false, 401);
      const user = await jwt.verify(token[1], process.env.SIGNIN_SECRET);

      if (!data) {
        this.tokenService.addToken(user.id, token[1], userRequest.userAgent, userRequest.ip, user.role);
      } else {
        console.log('dataAgents: ', data.userAgent, userRequest.userAgent);
        // if (data.userAgent != userRequest.userAgent)
        // throw new UserCustomException('توکن نامعتبر ! مجددا وارد شوید', false, 401);
        console.log('dataIp: ', data.ip, userRequest.ip);
        //if (data.ip != userRequest.ip) throw new UserCustomException('توکن نامعتبر ! مجددا وارد شوید', false, 401);
        if (data.status == false) throw new UserCustomException('توکن نامعتبر ! مجددا وارد شوید', false, 401);
      }

      console.log(user, 'user Token');
      console.log(new Date().getTime(), 'tt');
      return user.id;
    } catch {
      throw new UserCustomException('توکن نامعتبر ! مجددا وارد شوید', false, 401);
    }
  }

  async getProductId(req): Promise<any> {
    if (isEmpty(req.header('product'))) throw new UserCustomException('شناسه محصول نامعتبر است', false, 400);
    const productId = req.header('product');
    return productId;
  }

  async getProductDetailId(req): Promise<string> {
    if (isEmpty(req.header('productDetail')))
      throw new UserCustomException('شناسه جزئیات محصول نامعتبر است', false, 400);
    const productDetailId = req.header('productDetail');
    return productDetailId;
  }

  async getBasketAddressId(req): Promise<any> {
    if (isEmpty(req.header('addressid'))) {
      throw new FillFieldsException();
    }
    return req.header('addressid');
  }

  async getClubId(req): Promise<any> {
    if (isEmpty(req.header('clubid'))) throw new FillFieldsException();
    return req.header('clubid');
  }
  async getTerminalId(req): Promise<any> {
    if (isEmpty(req.header('terminalid'))) throw new FillFieldsException();
    return req.header('terminalid');
  }

  async getRole(req): Promise<any> {
    if (isEmpty(req.header('Authorization')))
      throw new UserCustomException('متاسفانه شما به این قسمت دسترسی ندارید', false, 401);
    const token = req.header('Authorization').split(' ');
    const user = await jwt.verify(token[1], process.env.SIGNIN_SECRET);
    return user.role;
  }

  async jwtVerify(): Promise<any> {
    return jwt.verify('', process.env.SIGNIN_SECRET);
  }

  async getMetchantCode(req): Promise<any> {
    if (isEmpty(req.header('merchantid'))) return 0;
    return req.header('merchantid');
  }

  async getUseridWithoutJWT(token): Promise<any> {
    const user = await jwt.verify(token, process.env.SIGNIN_SECRET);
    return user.id;
  }
  package(senderNo, to, message) {
    let form = format;
    form = form.replace('!!message', uniCode(message));
    form = form.replace('!!mobile', to);
    form = form.replace('!!sender', senderNo);
    return form;
  }
  async AsanaksendSMS(
    usernamex: string,
    passwordx: string,
    srcAddressesx: string,
    destAddressesx: string,
    msgBodyx: string
  ) {
    SendAsanakSms(
      process.env.ASANAK_USERNAME,
      process.env.ASANAK_PASSWORD,
      process.env.ASANAK_NUMBER,
      destAddressesx,
      msgBodyx
    );
    // const content = this.package('100075181000', destAddressesx, msgBodyx);
    // console.log(content);
    // var options = {
    //   method: 'POST',
    //   url: 'http://193.104.22.14:2055/CPSMSService/Access',
    //   headers: {
    //     'cache-control': 'no-cache',
    //     Authorization: 'Basic d2ViX2lyYW5pYW5jcmVkaXRjYXJkOjY3MXFueDIy',
    //   },
    //   body: content,
    // };
    // req(options, function (error, response, body) {
    //   if (error) throw new Error(error);
    //   console.log(body);
    // });
  }

  async registerCardInAsanPardakht(cardno: number): Promise<any> {
    const returnData = await this.AsanPardakhtClient.post('register/card', {
      cardNo: cardno,
      userId: this.userId,
      password: this.password,
    });
    console.log(returnData.data);
    return returnData.data;
  }

  async registerMerchantInAsanPardakht(merchantcode, terminalid): Promise<any> {
    const returnData = await this.AsanPardakhtClient.post('irdc/register/merchant', {
      userId: this.userId,
      password: this.password,
      merchantId: merchantcode,
      terminalId: terminalid,
    });
    console.log(returnData.data);
    return returnData.data;
  }

  async base64Upload(data: string): Promise<any> {
    const imageBuffer = await base64ImageUpload(data);
    const writeFile = promisify(fs.writeFile);
    const mime = imageBuffer.type.split('/');
    const filename = new Date().getTime() + '.' + mime[1];
    const returnData = await writeFile(UPLOAD_URI + filename, imageBuffer.data).catch((err) => {
      if (err) return faildOpt();
    });
    return {
      res: returnData,
      filename: filename,
    };
  }
}
