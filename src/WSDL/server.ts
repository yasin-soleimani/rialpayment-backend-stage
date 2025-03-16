import { ParsianConfirmSoapService } from './parsian/confirm';

var soap = require('soap');
var http = require('http');
import * as mongoose from 'mongoose';
import { ParsianSaleSoapService } from './parsian/SoapService';

class ParsianSoapApplication {
  constructor() {
    this.setupServer();
    this.setupMongoDB();
  }

  setupServer() {
    var xml = require('fs').readFileSync('pec.wsdl', 'utf8'),
      xmlConfirm = require('fs').readFileSync('pec-confirm.wsdl', 'utf8'),
      server = http.createServer(function (request, response) {
        response.end('404: Not Found: ' + request.url);
      });

    server.listen(8000);
    soap.listen(server, '/parsian/sale', ParsianSaleSoapService, xml);
    soap.listen(server, '/parsian/confirm', ParsianConfirmSoapService, xmlConfirm);
    console.log('Server Started ...');
  }

  setupMongoDB() {
    // @ts-ignore
    mongoose.Promise = global.Promise;
    // @ts-ignore
    mongoose.connect('mongodb://localhost/nest', { useNewUrlParser: true });
  }
}

new ParsianSoapApplication();
