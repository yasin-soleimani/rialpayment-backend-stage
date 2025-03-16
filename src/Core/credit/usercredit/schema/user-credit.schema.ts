import * as mongoose from "mongoose"
import * as mongoosePaginate from "mongoose-paginate"

const UserCredit1 = new mongoose.Schema({
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  amount: { type: Number, default: 0 },
  expire: { type: Date },
  from: { type: mongoose.SchemaTypes.ObjectId, ref: "User" }
})

UserCredit1.plugin(mongoosePaginate)

export const UserCreditSchema = UserCredit1
