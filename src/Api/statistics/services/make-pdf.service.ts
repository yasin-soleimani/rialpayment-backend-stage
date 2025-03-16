import { Injectable } from '@vision/common';
import * as fs from 'fs';
import * as pdf from 'html-pdf';
import { CardStatisticsMakePdfFormat } from '../function/pdf-format';

@Injectable()
export class StatisticsMakePdfApiService {
  constructor() {}

  async cardMakePdf(data, res): Promise<any> {
    const html = await fs.readFileSync('/home/younes/wordspace/Sepah-backend/view/pdf/report.html', 'utf8');
    const tmp = CardStatisticsMakePdfFormat(html, data);

    const write = await fs.writeFileSync('/home/younes/wordspace/Sepah-backend/view/pdf/report.html', 'utf8');
    const resultPdf = await this.makePdf(tmp, data.ref);

    var datax = fs.readFileSync(resultPdf.filename, 'utf8');
    res.contentType('application/pdf');
    return res.send(datax);
  }

  private async makePdf(data, ref): Promise<any> {
    var options = {
      format: 'A4',
      base: 'file:///home/younes/wordspace/Sepah-backend/view/',
    };

    return new Promise((resolve, reject) => {
      pdf.create(data, options).toFile('./pdf/' + ref + '.pdf', function (err, res) {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
}
