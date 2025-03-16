import * as express from 'express';
import * as http from 'http';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
if (fs.existsSync(path.resolve(__dirname, '../../.env')) && !process.env.NODE_ENV) {
  setTimeout(() => console.log('loaded env'), 5000);
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} else {
  setTimeout(() => console.log('loaded env2'), 5000);
  if (!process.env.NODE_ENV) dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
import { VisionFactory } from '@vision/core';
import * as morgan from 'morgan';
import { ApplicationModule } from './api.module';

import * as flash from 'connect-flash';
import * as fileupload from 'express-fileupload';
import { WebserviceModule } from './service.module';
import { urlencoded } from 'body-parser';
import * as session from 'express-session';
import { BackofficeModule } from './backoffice.module';

const MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
import * as responseTime from 'response-time';
import { MongoExceptionFilter } from './Filters/mongodb.filter';
import * as proxy from 'express-http-proxy';

// @ts-ignore
import helmet from 'helmet';
import { PUBLIC_DIR } from './__dir__';

async function bootstrap() {
  // config dot files
  // config server for api
  const apiserver = express();
  apiserver.use((req, res, next) => {
    next();
  });
  /*  apiserver.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding'
    );
    next();
  });*/
  apiserver.disable('x-powered-by');
  // set logger system
  apiserver.use(morgan('combined'));
  apiserver.use(
    '/vitrin',
    proxy(process.env.VITRIN_SERVICE_URL, {
      proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        // preserve client ip address in x-forwarded-for
        proxyReqOpts.headers['x-forwarded-for'] = srcReq.connection.remoteAddress;
        return proxyReqOpts;
      },
    })
  );
  apiserver.use(fileupload());

  // factory
  const api = await VisionFactory.create(ApplicationModule, apiserver);
  // api.useGlobalInterceptors( new TransformInterceptor() );
  api.setGlobalPrefix('v1');
  // api.useGlobalFilters(new MongoExceptionFilter());
  api.enableCors();
  api.useGlobalFilters(new MongoExceptionFilter());
  api.useStaticAssets(path.join(PUBLIC_DIR));
  api.setBaseViewsDir(path.join(PUBLIC_DIR, '../', 'views'));
  api.setViewEngine('ejs');
  apiserver.use(cookieParser());

  apiserver.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        url: process.env.MONGO_DB_URL,
        autoRemove: 'interval',
        autoRemoveInterval: 10, // In minutes. Default
      }),
      cookie: { maxAge: 3600000, secure: false, httpOnly: true },
    })
  );
  await api.init();
  // config server for service like ipg - 3rd party
  const serviceserver = express();
  serviceserver.use((req, res, next) => {
    next();
  });
  serviceserver.disable('x-powered-by');
  serviceserver.use(morgan('combined'));
  console.log('Server Started!');
  //@ts-ignore
  serviceserver.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          formAction: ["'self'", 'https://core-backend.rialpayment.ir/v1/leasing-apply/pay/callback', '*'],
          'script-src-attr': ["'unsafe-inline'"],
          connectSrc: ["'self'", 'https://service.rialpayment.ir'],
          imgSrc: ["'self'", 'data:', 'https://core-backend.rialpayment.ir'], // Allow external image source
          scriptSrc: [
            "'self'",
            // Add 'unsafe-inline' to allow all inline scripts (not recommended)
            "'unsafe-inline'",

            // Add specific hashes or nonces as needed
            // `'sha256-SkSfCt2+BFECsNiB9I1MFbJC+C2p7vfLsbOyqwnXzfI='`,
            // `'nonce-random123'`,
          ],
        },
      },
    })
  );

  const service = await VisionFactory.create(WebserviceModule, serviceserver);
  service.enableCors();

  service.useStaticAssets(path.join(path.join(PUBLIC_DIR)));
  service.setBaseViewsDir(path.join(PUBLIC_DIR, '../', 'views'));
  service.setViewEngine('ejs');
  service.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        url: process.env.MONGO_DB_URL,
        autoRemove: 'interval',
        autoRemoveInterval: 10, // In minutes. Default
      }),
      cookie: { maxAge: 3600000, secure: false, httpOnly: true },
    })
  );
  service.use(express.json());
  service.use(flash());
  await service.init();

  const backofficeServer = express();
  backofficeServer.use((req, res, next) => {
    next();
  });
  backofficeServer.use(responseTime());
  backofficeServer.disable('x-powered-by');
  backofficeServer.use(morgan('combined'));

  const backoffice = await VisionFactory.create(BackofficeModule, backofficeServer);
  backoffice.enableCors();
  backofficeServer.disable('x-powered-by');
  backofficeServer.use(morgan('combined'));
  backoffice.useGlobalFilters(new MongoExceptionFilter());
  backoffice.useStaticAssets(path.join(path.join(PUBLIC_DIR)));
  backoffice.setBaseViewsDir(path.join(PUBLIC_DIR, '../', 'views'));
  backoffice.use(urlencoded({ extended: true }));
  backoffice.use(fileupload());
  backoffice.use(express.urlencoded({ extended: false }));
  backoffice.use(express.json());
  await backoffice.init();

  // api.useGlobalGuards(new GlobalGuard(userService))

  // make & set port servers
  http.createServer(backofficeServer).listen(3005);
  http.createServer(apiserver).listen(2004);
  http.createServer(serviceserver).listen(2524);
}

bootstrap();
