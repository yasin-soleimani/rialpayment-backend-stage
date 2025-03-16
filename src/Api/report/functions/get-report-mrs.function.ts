import { ReportApiDto } from '../dto/report.dto';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
let client = axios.create({
  baseURL: 'https://webservice.iccard.ir:8080/report/',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export async function getReportFromMrs(getInfo: ReportApiDto, page): Promise<any> {
  const header = {
    'cache-control': 'no-cache',
    'Content-Type': 'application/json',
    page: page,
  };

  return client.post('filter', getInfo, { headers: header }).catch((err) => console.log(err, 'er'));
}

export async function getExcelReportFromMrs(getInfo: ReportApiDto): Promise<any> {
  const header = {
    'cache-control': 'no-cache',
    'Content-Type': 'application/json',
  };

  return client.post('excel', getInfo, { headers: header }).catch((err) => console.log(err, 'er'));
}
