import * as soap from 'soap';
import * as momentjs from 'jalali-moment';

export class InsuranceSinaThirdParty {
  private baseUrl = 'https://sinaap.sinainsurance.com/SinaApSetBN.asmx?WSDL';
  private header = {
    AuthHeader: {
      Username: 'Iran_Sinainsurance_JydTgMiFGD',
      Password: 'jKKlStG584@r$ldpT86&tsfgstRlo428TdtIkt556T4',
    },
  };

  constructor() {}

  private async connection(): Promise<any> {
    let client = await soap.createClientAsync(this.baseUrl);
    client.addSoapHeader(this.header, '', 'tns', 'https://s-fan3.sina.local/');
    return client;
  }

  async getInternalTravel(data: any): Promise<any> {
    const client = await this.connection();
    console.log(JSON.stringify(data));
    return client
      .APInsurancejsonInputAsync({
        Input: JSON.stringify(data),
      })
      .then((res) => {
        console.log(res[0]);
        return res[0].APInsurancejsonInputResult;
      });
  }

  getInternalTravelModel(data, info, productinfo) {
    return {
      Transid: info.transid,
      mb: data.mobile,
      Tdate: momentjs().locale('fa').format('YYYY/MM/DD'),
      ttime: momentjs().locale('fa').format('HH:mm'),
      Nc: data.nationalcode,
      Na: data.fname,
      Lna: data.lname,
      Fna: data.father,
      INo: Number(data.shenasno),
      BYear: Number(data.byear),
      BMonth: Number(data.bmonth),
      BDay: Number(data.bday),
      PCode: data.postalcode,
      Tid: Number(productinfo.id),
      Prm: String(productinfo.amount),
      UoA: false,
      Jens: Number(data.sex),
      Mso: 0,
      PolicyStartDate: '1398/12/15',
      CompanyCode: 2,
    };
  }
  // { APInsurancejsonInputResult:
  //   { Output: 1,
  //     Bno: '',
  //     link:
  //      'http://sinainsurance.com/index.php?module=pmk&page_id=393&transid=300000000200043&spTransId=300000000200043&SearchBtn=1&standalone=1&die=1&pdf=1' } }
}
