import { HttpsOptions } from '@vision/common/interfaces/external/https-options.interface';
import { LoggerService } from '@vision/common/services/logger.service';
import { VisionApplicationContextOptions } from '@vision/common/interfaces/vision-application-context-options.interface';
import { CorsOptions } from '@vision/common/interfaces/external/cors-options.interface';

export interface VisionApplicationOptions extends VisionApplicationContextOptions {
  cors?: boolean | CorsOptions;
  bodyParser?: boolean;
  httpsOptions?: HttpsOptions;
}
