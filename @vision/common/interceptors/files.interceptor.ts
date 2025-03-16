import * as multer from 'multer';
import { VisionInterceptor } from '@vision/common/interfaces/features/vision-interceptor.interface';
import { Observable } from 'rxjs';
import { MulterOptions } from '@vision/common/interfaces/external/multer-options.interface';
import { transformException } from '@vision/common/interceptors/multer/multer.utils';
import { ExecutionContext } from '@vision/common/interfaces';

export function FilesInterceptor(
  fieldName: string,
  maxCount?: number,
  options?: MulterOptions,
) {
  const Interceptor = class implements VisionInterceptor {
    readonly upload = multer(options);

    async intercept(
      context: ExecutionContext,
      call$: Observable<any>,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();

      await new Promise((resolve, reject) =>
        this.upload.array(fieldName, maxCount)(
          ctx.getRequest(),
          ctx.getResponse(),
          err => {
            if (err) {
              const error = transformException(err);
              return reject(error);
            }
            resolve( true );
          },
        ),
      );
      return call$;
    }
  };
  return Interceptor;
}
