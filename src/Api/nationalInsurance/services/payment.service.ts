// import { Injectable } from "@vision/common";
// import { MipgService } from "src/Service/mipg/mipg.service";

// @Injectable()
// export class NationalInsurancePaymentApiService{

//   constructor(
//     private readonly mipgService: MipgService
//   ) {}

//   async getToken( terminalid: number, amount: number, invoiceid: string, callbackurl ): Promise<any> {
//     const params = this.getModel( terminalid, amount, invoiceid, callbackurl);
//     const token = await this.mipgService.validate(params)
//   }

//   private getModel( terminalid: number, amount: number, invoiceid: string, callbackurl ) {
//     return {
//       terminalid: terminalid,
//       amount: amount,
//       payload: '',
//       callbackurl: callbackurl,
//       invoiceid: invoiceid
//     }
//   }

// }
