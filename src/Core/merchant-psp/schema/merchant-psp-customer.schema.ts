import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

export const MerchantPspCustomerSchema = new mongoose.Schema(
  {
    type: { type: Number },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    savedId: { type: String },
    res: { type: String },

    CustomerTypeID: { type: Number },
    NationalCode: { type: String },
    BCID: { type: String },
    Email: { type: String },
    FirstName: { type: String },
    LastName: { type: String },
    Mobile: { type: String },
    BirthDate: { type: Date, required: true },
    FatherName: { type: String },
    FatherNameEn: { type: String },
    GenderID: { type: Number },
    CompanyCode: { type: String },
    CompanyName: { type: String },
    CompanyFoundationDate: { type: Date },
    ISForeignNationals: { type: Boolean, default: false },
    ForeignersPervasiveCode: { type: String },
    PassportCode: { type: String },
    PassportCreditDate: { type: Date },
    Country: { type: String },
    CompanyNameEn: { type: String },
    CompanyRegisterNo: { type: String },
    FirstNameEN: { type: String },
    LastNameEN: { type: String },
  },
  { timestamps: true }
);

MerchantPspCustomerSchema.plugin(mongoosePaginate);
