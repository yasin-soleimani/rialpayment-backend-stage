
import * as soap from 'soap';

export async function getIbanFromAsanPardakht (merchantid: number): Promise<any>  {
  const args = {
    username : 'irdcuzr',
    password : 'dcpsw7t',
    merchantID : merchantid,
  };

var p = new Promise(function(resolve, reject) {
  soap.createClient('http://services.asanpardakht.ir/IRDCHelpers.asmx?wsdl', (err: string, client: any ) => {
    if (err){
      return reject(err);
    }
    client.GetIBANS(args, ( error: string, result: string) => {
      if ( error ) return reject(error);
      console.log(result);
      return resolve(result);
    });
  });
});

return p;

}
