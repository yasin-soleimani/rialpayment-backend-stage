import { Inject, Injectable } from '@vision/common';
import { AggregatePaginateModel } from '../../utils/types.util';
import { LeasingInstallments, LeasingInstallmentsDocument } from './interfaces/leasing-installments.interface';
import { LeasingInstallmentToPay } from '../../Api/leasing-installments/dto/pay-installments.dto';

@Injectable()
export class LeasingInstallmentsCoreService {
  constructor(
    @Inject('LeasingInstallmentsModel')
    private readonly installmentsModel: AggregatePaginateModel<LeasingInstallmentsDocument>
  ) {}

  async getByLeasingUserCreditId(leasingUserCredit: string): Promise<LeasingInstallments[]> {
    return this.installmentsModel.find({ leasingUserCredit }).lean().select({
      _id: 1,
      paid: 1,
      amount: 1,
      paidDate: 1,
      dueDate: 1,
      createdAt: 1,
      updatedAt: 1,
      invoiceId: 1,
      paidAmount: 1,
    });
  }

  async setUnpaid(id: string, userId: string): Promise<LeasingInstallments> {
    return this.installmentsModel.findOneAndUpdate(
      { _id: id, user: userId },
      {
        paid: false,
        paidDate: null,
      },
      { new: true }
    );
  }

  async getById(id: string): Promise<LeasingInstallments> {
    return this.installmentsModel.findOne({ _id: id }).lean();
  }

  async create(installment: LeasingInstallments): Promise<LeasingInstallments> {
    return this.installmentsModel.create(installment);
  }

  async bulkCreate(installments: LeasingInstallments[]): Promise<LeasingInstallments[]> {
    return this.installmentsModel.insertMany(installments);
  }

  async setInvoiceId(installment: string, invoiceId: string): Promise<LeasingInstallmentsDocument> {
    return this.installmentsModel.findOneAndUpdate(
      { _id: installment },
      {
        $set: {
          invoiceId,
        },
      },
      { new: true }
    );
  }

  async setBulkInvoiceId(installments: string[], invoiceId: string): Promise<any> {
    return this.installmentsModel.updateMany(
      { _id: { $in: installments } },
      {
        $set: {
          invoiceId,
        },
      },
      {
        new: true,
      }
    );
  }

  async findManyByIds(ids: string[]): Promise<LeasingInstallmentsDocument[]> {
    return this.installmentsModel.find({ _id: { $in: ids } }).populate('leasingUserCredit');
  }

  async setPaid(installment: LeasingInstallmentToPay, invoiceId: string): Promise<any> {
    return this.installmentsModel.findOneAndUpdate(
      { _id: installment.id },
      {
        $set: {
          paid: true,
          paidDate: new Date(),
          paidAmount: installment.amount,
          invoiceId: invoiceId,
        },
      },
      {
        new: true,
      }
    );
  }

  async setBulkPaid(installments: string[]): Promise<any> {
    return this.installmentsModel.updateMany(
      { _id: { $in: installments } },
      {
        $set: {
          paid: true,
          paidDate: new Date(),
        },
      },
      {
        new: true,
      }
    );
  }
}
