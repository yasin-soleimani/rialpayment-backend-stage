import { ParsianConfirmRequest } from './confirm-class.';

export const ParsianConfirmSoapService = {
  ConfirmService: {
    ConfirmServiceSoap: {
      ConfirmPayment: function (args, callback, headers, req) {
        return ParsianConfirmRequest(args, req, function (res) {
          callback(res);
        });
      },
    },
  },
};
