import { Controller, Post, Body, Req } from '@vision/common';
import { PostApiService } from './post.service';
import { getUsernamPassword } from '@vision/common/utils/load-package.util';

@Controller('post')
export class PostController {
  constructor(private readonly postApiService: PostApiService) {}

  @Post()
  async getInfo(@Body() getInfo, @Req() req): Promise<any> {
    const userpass = getUsernamPassword(req);
    return this.postApiService.play(userpass.username, userpass.password, getInfo.postalcode, req);
  }
}
