import { Inject, Injectable } from '@vision/common';
import { Model } from 'mongoose';

@Injectable()
export class RequestCoreService {
  constructor(@Inject('RequestModel') private readonly requestModel: Model<any>) {}

  async submit(username: string, password: string, ip: string, request: string, response: string): Promise<any> {
    return this.requestModel.create({
      username: username,
      password: password,
      ip: ip,
      request: request,
      response: response,
    });
  }
}
