import axios,{ AxiosInstance } from 'axios';
import * as https from 'https';
import * as qs from 'querystring';

export class IzbankService {
  private client: AxiosInstance;

  constructor(){
    this.client = axios.create({
      baseURL: 'https://apigateway.izbank.ir/',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'fa',
        'App-Key': '13008',
        'Device-Id': '185.105.187.126',
        'Bank-Id': 'IRZAIR',
        'Token-Id': '08d752138551f78e8e7db69a542fe8e0',
        'CLIENT-DEVICE-ID': '185.105.187.126',
        'CLIENT-IP-ADDRESS': '185.105.187.126',
        'CLIENT-USER-AGENT': 'Chrome/66.0.3359.181',
        'CLIENT-USER-ID': '09125031469',
        'CLIENT-PLATFORM-TYPE': 'WEB',
       },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  async getCardInfo(cardno: string ): Promise<any> {
    const query = '{"pan" : 5057851010528351 , \
    "destination_pan" : ' + cardno+' , \
    "pin" : "19981" , \
    "pin_type" : "CARD" , \
    "cvv2" : 129 , \
    "exp_date" : 9806 , \
    "amount" : 10000 , \
    "loan_number" : "*******" \
    }';

    const { data } = await this.client.post('v1/cards/holder', query );
    return data;
  }


}