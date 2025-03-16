import axios, { AxiosInstance } from "axios"
import * as process from "process"
//import { BillInquiryConfigConst } from "../../../src/Core/bill-inquiry/const/config.const"

const client: AxiosInstance = axios.create({
  baseURL: process.env.SMS_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function SendAsanakSms(username, password, sourcenumber, mobile, message) {

  /*const url = process.env.SMS_ASANAK_URL;
  const args = {
    userCredential: {
      username: username,
      password: password,
    },
    srcAddresses: sourcenumber,
    destAddresses: mobile,
    msgBody: message,
    msgEncoding: '8',
  };

  const client = await soap.createClientAsync(url);
  if (!client) return false;
  const data = await client.sendSmsAsync(args);*/

  try {
    console.log("sms base url:::",process.env.SMS_SERVICE_URL)
    const data = await client.request({method: "post", baseURL:process.env.SMS_SERVICE_URL ,url:"sms/", data: {phoneNumber:mobile, message}})
    console.log(data.data, 'sms data');
    return data.data;
  }
  catch (e){
    console.log(e, '<---------------- Errors on Sending Sms <===================');
    return ''
  }

}
