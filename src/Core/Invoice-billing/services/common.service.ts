import { Inject, Injectable } from '@vision/common';

@Injectable()
export class InvoiceBillingCommonCoreService {
  constructor(
    @Inject('InvoiceModel') private readonly invoiceModel: any,
    @Inject('InvoiceDetailsModel') private readonly invoiceDetailsModel: any
  ) {}

  async cancelInvoice(id: string): Promise<any> {
    return this.invoiceModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          cancel: true,
        },
      }
    );
  }

  async getList(page: number, type: number, from, to): Promise<any> {
    return this.invoiceModel.paginate(
      {
        type,
        date: {
          $gte: from,
          $lte: to,
        },
      },
      { page: page, populate: 'items', sort: { createdAt: -1 }, limit: 50 }
    );
  }

  async getData(type: number, from, to): Promise<any> {
    return this.invoiceModel.findOne({
      type,
      date: {
        $gte: from,
        $lte: to,
      },
    });
  }

  async addInvoice(data, invoiceno, type: number, date): Promise<any> {
    return this.invoiceModel.create({
      type,
      date: date,
      invoiceno,
      fullname: data._id.fullname,
      tel: data._id.mobile,
      address: data._id.place,
      nationalcode: data._id.nationalcode,
    });
  }

  async updateDetails(id: string, details): Promise<any> {
    return this.invoiceModel.findOneAndUpdate({ _id: id }, { $set: { details } });
  }
  async addDetails(data, details, row, title, unit, unitprice, invoiceid): Promise<any> {
    return this.invoiceDetailsModel.create({
      row: row,
      title: title,
      qty: data.count,
      unit,
      unitprice: unitprice,
      totalamount: data.total,
      totalwage: data.wage,
      companywage: details.companywage,
      agentwage: details.agentwage,
      payamount: data.amount,
      tax: details.tax,
      pureamount: details.companywage + details.tax,
      invoice: invoiceid,
    });
  }
}
