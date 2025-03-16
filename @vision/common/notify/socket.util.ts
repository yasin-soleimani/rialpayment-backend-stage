import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import * as process from "process"

export async function sendSocketMessage(clientid: string, message: string): Promise<any> {
  // axios.defaults.baseURL = 'https://api.iccard.ir:61230/';
  axios.defaults.baseURL = process.env.SOCKET_SERVICE_URL.startsWith('http') ? process.env.SOCKET_SERVICE_URL : "https://"+process.env.SOCKET_SERVICE_URL;

  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  const args = qs.stringify({
    clientid: clientid,
    message: message
  });
  const data = await axios.post('all/', args);
  return data.data;
}