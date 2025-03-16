import { Controller, Post, Body, Req } from '@vision/common';
import { NationalInsuranceAuthApiService } from '../services/auth.service';

@Controller('nationalinsurance/auth')
export class NationalInsuranceAuthController {
  constructor(private readonly authService: NationalInsuranceAuthApiService) {}

  @Post('login')
  async getLogin(@Body() getInfo, @Req() req): Promise<any> {
    return this.authService.checkLogin(getInfo.mobile, getInfo.password, req);
  }

  @Post('getinfo')
  async getInformation(@Body() getInfo): Promise<any> {
    return this.authService.getNationalInformation(getInfo.nin, getInfo.category);
  }
}
