import { Module } from '@vision/common/decorators/modules/module.decorator';
import { HttpService } from '@vision/common/http/http.service';

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
