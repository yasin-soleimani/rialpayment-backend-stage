import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import * as qs from 'querystring';

let client: AxiosInstance;
client = axios.create({
  baseURL: 'https://service.rialpayment.ir',
  headers: {
    'cache-control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
export async function getTokenIpg(
  terminalid: string,
  amount: number,
  invoiceid: string,
  callbackurl: string
): Promise<any> {
  const params = qs.stringify({
    terminalid: terminalid,
    amount: amount,
    invoiceid: invoiceid,
    callbackurl: callbackurl,
    payload: '',
  });
  const { data } = await client.post('/', params);
  return data;
}
export async function confirmIpg(terminalid: string, userinvoice: string): Promise<any> {
  const params = qs.stringify({
    terminalid: terminalid,
    ref: userinvoice,
  });
  const { data } = await client.post('/pay/status', params);
  return data;
}
