import { Injectable, successOptWithPagination } from '@vision/common';
import { PspverifyCoreService } from '../../../Core/psp/pspverify/pspverifyCore.service';

@Injectable()
export class PaymentOrganizationService {
  constructor(private readonly pspVerifyService: PspverifyCoreService) {}

  async getList(userid: string, page: number): Promise<any> {
    let tmpArray = Array();

    const data = await this.pspVerifyService.findOrgan(userid, page);
    for (let i = 0; data.docs.length > i; i++) {
      const getLast = await this.pspVerifyService.getLastOrgan(userid, data.docs[i]._id);
      const getFirst = await this.pspVerifyService.getFirstOrgan(userid, data.docs[i]._id);
      console.log(data.docs[i].terminals[0][0]);
      tmpArray.push({
        _id: data.docs[i]._id,
        organ: data.docs[i].organ,
        amount: data.docs[i].amount,
        charge: data.docs[i].charge,
        start: getFirst.createdAt,
        end: getLast.createdAt,
        status: false,
        title: data.docs[i].terminals[0][0].title,
      });
    }

    data.docs = tmpArray;
    return successOptWithPagination(data);
  }

  async getDetails(userid: string, terminal: string, page: number): Promise<any> {
    const data = await this.pspVerifyService.getDetailsOrgan(userid, terminal, page);
    let tmpArray = Array();
    for (let i = 0; data.docs.length > i; i++) {
      if (data.docs[i].user) {
        tmpArray.push({
          title: data.docs[i].terminal.title,
          date: data.docs[i].createdAt,
          fullname: data.docs[i].user.fullname,
          status: false,
          amount: data.docs[i].amount,
          _id: data.docs[i]._id,
        });
      } else {
        tmpArray.push({
          title: data.docs[i].terminal.title,
          date: data.docs[i].createdAt,
          fullname: '',
          status: false,
          amount: data.docs[i].amount,
          _id: data.docs[i]._id,
        });
      }
    }
    data.docs = tmpArray;
    return successOptWithPagination(data);
  }
}
