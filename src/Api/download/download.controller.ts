import { Controller, Get, Param, Req, Res, Session } from '@vision/common';
import { GeneralService } from '../../Core/service/general.service';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(private readonly generalService: GeneralService, private readonly downloadService: DownloadService) {}

  @Get('shop/:shopid/:productid')
  async getDownload(
    @Param('shopid') shopid,
    @Param('productid') productid,
    @Req() req,
    @Session() session
  ): Promise<any> {
    const userid = await this.generalService.getUserid(req);
    return this.downloadService.downloadShop(userid, shopid, productid, session);
  }
  @Get('link/:id')
  async setSession(@Param('id') id, @Res() res, @Session() session): Promise<any> {
    return this.downloadService.getLink(id, session, res);
  }

  @Get('lz')
  async xSession(@Param('id') id, @Res() res, @Session() session, @Req() req): Promise<any> {
    console.log(session);
    console.log(req.cookies['connect.sid']);
    console.log(new Date().getTime());
  }

  @Get('xz')
  async zSession(@Param('id') id, @Res() res, @Session() session, @Req() req): Promise<any> {
    session['now'] = new Date().getTime();
    console.log(req.cookies['connect.sid']);
    console.log(session);
  }
}
