import { Controller, Get, Res, Req } from '@vision/common';
import { EventEmitter } from 'events';

@Controller('version')
export class VersionController {
  constructor() {}

  @Get('android')
  async getAndroid(@Req() req): Promise<any> {
    if (req.query && req.query.packagename == 'ir.iccard.mehrpay') {
      return {
        version: 1575983628,
        type: 1,
      };
    } else {
      return {
        version: 1566102219,
        type: 1,
      };
    }
  }

  @Get('ios')
  async getIos(): Promise<any> {
    return {
      status: 200,
      success: true,
      message: '',
      version: 1,
      type: 1,
    };
  }

  @Get('message')
  async getMessage(): Promise<any> {
    return {
      status: 200,
      success: true,
      message: 'عملیات با موفقیت انجام شد',
      data: '',
    };
  }

  @Get('test')
  async test() {
    const myEmitter = new EventEmitter();
    myEmitter.emit('eventOne');
  }

  @Get('sadsadsa')
  async sadsad(@Req() req): Promise<any> {}
}
