import * as soap from 'soap';

export class BankSepah {

  private finUrl  = 'https://ib.ebanksepah.ir/ws/SepahFinancialWebServiceGate?wsdl';
  private username = '292885571';
  private password = '66537330';
  constructor() {
  }

  async getShebInfo ( iban: string ): Promise<any> {
    const client = await soap.createClientAsync( this.finUrl );
    const login = await client.loginAsync({ arg0: this.username, arg1: this.password });

    return client.inquiryOtherBankIbanInfoAsync({
      arg0: login[0].return.sessionId,
      arg1: iban,
      arg2: null
    });
  }
}