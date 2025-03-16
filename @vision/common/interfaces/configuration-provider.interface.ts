import { VisionInterceptor } from '@vision/common/interfaces/features/vision-interceptor.interface';
import { CanActivate } from '@vision/common/interfaces/features/can-activate.interface';

export interface ConfigurationProvider {
  getGlobalInterceptors(): VisionInterceptor[];
  getGlobalGuards(): CanActivate[];
}
