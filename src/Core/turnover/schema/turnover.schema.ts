import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import * as mongooseAggregatePaginate from 'mongoose-aggregate-paginate';

export const TurnoverSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'discount' },
    // terminals: [{
    //   type: mongoose.SchemaTypes.ObjectId, ref: ''
    // }],
    terminal: { type: mongoose.SchemaTypes.ObjectId, ref: '' },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    card: { type: mongoose.SchemaTypes.ObjectId, ref: 'Card' },
    in: { type: Number, required: true },
    out: { type: Number, required: true },
    remain: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    ref: { type: String },
    visible: { type: Boolean, default: true },
    leasingApply: { type: mongoose.SchemaTypes.ObjectId, ref: 'LeasingApply' },
    leasing: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
TurnoverSchema.index({ terminal: 1 });
TurnoverSchema.index({ user: 1 });
TurnoverSchema.index({ card: 1 });
TurnoverSchema.index({ type: 1 });
TurnoverSchema.index({ createdAt: 1 });
TurnoverSchema.plugin(mongoosePaginate);
TurnoverSchema.plugin(mongooseAggregatePaginate);
