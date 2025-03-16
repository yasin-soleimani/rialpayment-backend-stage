import { ArgumentsHost, Catch, ExceptionFilter } from '@vision/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.code;
    console.log('exception mongo::', exception);
    switch (exception.code) {
      case 11000: {
        response.status(200).json({
          status: 201,
          success: false,
          message: 'مقدار وارد شده تکراری می باشد',
        });
        break;
      }
    }
  }
}
