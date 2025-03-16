import * as mongoose from 'mongoose';

export const CardmanagementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    cardno: { type: Number, required: true, unique: true },
    cardowner: { type: Boolean, required: true },
    cardrelatione: { type: String, required: true },
    cardownerfullname: { type: String, required: true },
    organ: Boolean,
    status: Boolean,
    res: String,
    registerd: Boolean,
    tried: { type: Number, default: 0 },
  },
  { timestamps: true }
);
