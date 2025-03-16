import { Controller, Get, Post, Put, Req } from '@vision/common';
import { ProfileService } from './profile.service';
import { UserService } from '../../Core/useraccount/user/user.service';
import { ProfileDto, ProfileLinkSettingsDto } from './dto/profile.dto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Body } from '@vision/common/decorators/http/route-params.decorator';
import { GeneralService } from '../../Core/service/general.service';
import { CompleteUserDto } from './dto/complete.dto';
import { LegalDto } from './dto/legal.dto';
import { UserCustomException } from '@vision/common/exceptions/userCustom.exception';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly authService: ProfileService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly generalService: GeneralService
  ) {}

  @Get()
  async getProfile(@Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.userService.getProfile(userid);
  }

  @Put()
  async updateProfile(@Req() req, @Body() profileDto: ProfileDto): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.userService.updateProfile(userid, profileDto);
  }

  @Put('linksettings')
  async updateProfileLinkSettings(@Req() req, @Body() linkSettingsDto: ProfileLinkSettingsDto): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.userService.updateProfileLinkSettings(userid, linkSettingsDto);
  }

  @Post('upload')
  async uploadProfile(@Req() req) {
    const userid = await this.generalService.getUserid(req);
    return await this.profileService.uploadAvatar(req, userid);
  }

  @Put('complete')
  async updateComplete(@Body() getInfo: CompleteUserDto, @Req() req): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return await this.userService.completeUpdate(userid, getInfo);
  }

  @Put('legal')
  async completeLegal(@Body() getInfo: LegalDto, @Req() req): Promise<any> {
    console.log(getInfo);
    const userid = await this.generalService.getUserid(req);
    const data = await this.profileService.uploadAvatar(req, userid);
    if (!data.success) throw new UserCustomException('متاسفانه عملیات با خطا مواجه شده است', false, 500);
    return await this.userService.completeLegal(getInfo, userid);
  }
}
