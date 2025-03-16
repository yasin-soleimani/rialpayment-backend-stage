import { Inject, Injectable } from '@vision/common';
import { isEmpty } from '@vision/common/utils/shared.utils';
import { timestamoToISO } from '@vision/common/utils/month-diff.util';

@Injectable()
export class IpgReportService {
  constructor(@Inject('IpgModel') private readonly ipgModel: any) {}

  async getReport(userid, terminalid, page, start?, end?): Promise<any> {
    if (isEmpty(start)) {
      return this.lastReport(terminalid, page);
    } else {
      const startISO = timestamoToISO(parseInt(start) * 1000);
      console.log(startISO);
      const endISO = timestamoToISO(parseInt(end) * 1000);
      console.log(endISO);
      return this.rangeReport(terminalid, page, startISO, endISO);
    }
  }

  private async rangeReport(terminalid, page, start, end): Promise<any> {
    const query = {
      terminalid: terminalid,
      amount: {
        $gt: 0,
      },
      updatedAt: {
        $gte: start,
        $lte: end,
      },
    };

    const data = await this.ipgModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
    let tmpArray = Array();
    for (let index in data.docs) {
      let status = data.docs[index].details.respcode == 0 || data.docs[index].details.respcode == '00' ? true : false;
      tmpArray.push({
        terminalid: data.docs[index].terminalid,
        date: data.docs[index].updatedAt,
        amount: data.docs[index].amount,
        wage: data.docs[index].wage,
        cardnumber: data.docs[index].details.cardnumber || '',
        ref: data.docs[index].userinvoice,
        status: status,
        share: false,
      });
    }
    data.docs = tmpArray;
    return data;
  }

  private async lastReport(terminalid, page): Promise<any> {
    const query = {
      terminalid: terminalid,
      amount: {
        $gt: 0,
      },
    };
    const data = await this.ipgModel.paginate(query, { page, sort: { createdAt: -1 }, limit: 50 });
    let tmpArray = Array();
    for (let index in data.docs) {
      let status = data.docs[index].details.respcode == 0 || data.docs[index].details.respcode == '00' ? true : false;
      tmpArray.push({
        terminalid: data.docs[index].terminalid,
        date: data.docs[index].updatedAt,
        amount: data.docs[index].amount,
        wage: data.docs[index].wage || 0,
        cardnumber: data.docs[index].details.cardnumber || '',
        ref: data.docs[index].userinvoice,
        status: status,
        share: false,
      });
    }
    data.docs = tmpArray;
    return data;
  }

  async getTime(date): Promise<any> {
    return this.ipgModel.find({
      'details.respcode': 0,
      createdAt: { $lt: new Date(date) },
      $or: [{ paytype: 1 }, { paytype: 2 }],
      total: {
        $gt: 0,
      },
    });
  }

  async getLast(): Promise<any> {
    return this.ipgModel
      .findOne({
        'details.respcode': 0,
        $or: [{ paytype: 1 }, { paytype: 2 }],
        total: {
          $gt: 0,
        },
      })
      .sort({ createdAt: -1 });
  }
  async getAll(perPage, page): Promise<any> {
    return this.ipgModel
      .find({
        'details.respcode': 0,
        $or: [{ paytype: 1 }, { paytype: 2 }],
        total: {
          $gt: 0,
        },
      })
      .limit(perPage)
      .skip(perPage * page);
  }
}
