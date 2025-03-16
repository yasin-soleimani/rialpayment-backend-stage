import { ParsianSaleRequest } from './sale';

export const ParsianSaleSoapService = {
  SaleService: {
    SaleServiceSoap: {
      SalePaymentRequest: function (args, callback, headers, req) {
        return ParsianSaleRequest(args, req, function (res) {
          callback(res);
        });
      },
    },
  },
};
