import { Injectable, successOpt, successOptWithDataNoValidation } from "@vision/common";
import * as soap from 'soap'
import { UserCustomException } from "@vision/common/exceptions/userCustom.exception";
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SendToAllMelliPayamakApiService {

  private url = 'http://api.payamak-panel.com/post/Actions.asmx?wsdl';
  private username = '09122460636';
  private password = 'Vahid@75181000';
  private number = '50004001460636';

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://console.melipayamak.com/api/',
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      },
    });
  }

  async getBrachns(code): Promise<any> {

    const client = await soap.createClientAsync(this.url);
    let result = await client.GetBranchsAsync({
      username: this.username,
      password: this.password,
      owner: code
    });

    if (!result[0].GetBranchsResult) return successOptWithDataNoValidation([]);
    return successOptWithDataNoValidation(result[0].GetBranchsResult.Branchs);
  }

  async getBulkCount(branchCode, from, to): Promise<any> {
    const client = await soap.createClientAsync(this.url);
    let result = await client.GetBulkCountAsync({
      username: this.username,
      password: this.password,
      branch: branchCode,
      rangeFrom: from,
      rangeTo: to
    });

    if (!result[0]) throw new UserCustomException('شاخه مورد نظر یافت نشد', false, 404);
    return successOptWithDataNoValidation(result[0].GetBulkCountResult);
  }


  async bulkSend(title, message, branchCode, from, to, DateToSend, requestCount): Promise<any> {
    const client = await soap.createClientAsync(this.url);
    let result = await client.AddBulkAsync({
      username: this.username,
      password: this.password,
      from: this.number,
      branch: branchCode,
      bulkType: 2,
      title: title,
      rangeFrom: from,
      rangeTo: to,
      message,
      DateToSend,
      requestCount,
      rowFrom: 0
    });

    if (!result[0]) throw new UserCustomException('شاخه مورد نظر یافت نشد', false, 404);
    return successOpt();
  }


  async sendMultiSms(to, message): Promise<any> {
    const data = await this.client.post('send/advanced/782dd5b02bda4c62911233aa144f9e89', {
      "from": this.number,
      "to": to,
      "text": message,
      "udh": ""
    });

    console.log(data, 'result');

    return data;
  }
}