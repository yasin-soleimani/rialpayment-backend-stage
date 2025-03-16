import axios, { AxiosInstance } from 'axios';

export async function nahabRequest(pan): Promise<any> {
  let client: AxiosInstance;
  const auth ='info@iccmail.ir:Aamir106321@1';
  client = axios.create({
    baseURL: 'https://esbapi.pec.ir/ApiManager/Vas/',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic '+ Buffer.from(auth).toString('base64'),
      'Connection': 'keep-alive'
    } ,
  });

  return client.post('PanOwnerRequest', {
    pan: pan,
    requestId: new Date().getTime(),
  }).then( res => res.data );
}