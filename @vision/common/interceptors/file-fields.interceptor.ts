import * as multer from 'multer';
import { Observable } from 'rxjs';
import { ExecutionContext } from '@vision/common/interfaces';
import { MulterField, MulterOptions } from '@vision/common/interfaces/external/multer-options.interface';
import { VisionInterceptor } from '@vision/common/interfaces/features/vision-interceptor.interface';
import { transformException } from '@vision/common/interceptors/multer/multer.utils';

export function FileFieldsInterceptor(
  uploadFields: MulterField[],
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
        this.upload.fields(uploadFields)(
          ctx.getRequest(),
          ctx.getResponse(),
          err => {
            if (err) {
              const error = transformException(err);
              return reject(error);
            }
            resolve(true);
          },
        ),
      );
      return call$;
    }
  };
  return Interceptor;
}
