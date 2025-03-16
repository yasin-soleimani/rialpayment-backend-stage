import { Injectable } from '@vision/common';
import axios, { AxiosInstance } from 'axios';
import { format, Rahyab } from '@vision/common/constants/rahyab.const';
// import { Iconv } from 'iconv';
import { uniCode } from '@vision/common/utils/unicode.util';
import * as req from 'request';

@Injectable()
export class RahyabCommonCoreService {
  private RahyabClient: AxiosInstance;
  constructor() {
    const auth = Rahyab.username + ':' + Rahyab.password;
    this.RahyabClient = axios.create({
      baseURL: Rahyab.host + ':' + Rahyab.port,
      headers: {
        'Content-Type': 'text/xml',
        Authorization: 'Basic ' + Buffer.from(auth).toString('base64'),
        Connection: 'keep-alive',
      },
    });
  }

  async sendPackage(sender, mobile, message): Promise<any> {
    const content = await this.package(sender, mobile, message);
    console.log(content);
    var options = {
      method: 'POST',
      url: 'http://193.104.22.14:2055/CPSMSService/Access',
      headers: {
        'Postman-Token': '0ad97127-ba56-4444-9da5-61d2542ff653',
        'cache-control': 'no-cache',
        Authorization: 'Basic d2ViX2lyYW5pYW5jcmVkaXRjYXJkOjY3MXFueDIy',
      },
      body: content,
    };
    req(options, function (error, response, body) {
      if (error) throw new Error(error);
      console.log(body);
    });
    // return this.RahyabClient.post(Rahyab.url, content).then(val => console.log(val, 'val')).catch( err => {
    //   console.log(err, 'err');
    // })
  }

  async package(senderNo, to, message): Promise<any> {
    let form = format;
    form = form.replace('!!message', uniCode(message));
    form = form.replace('!!mobile', to);
    form = form.replace('!!sender', senderNo);
    return form;
  }
}
