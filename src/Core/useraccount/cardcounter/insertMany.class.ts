import * as mongoose from 'mongoose';
import { UserSchema } from '../user/schemas/user.schema';

export class insertManyUserSeries {
  async insertUser(data): Promise<any> {
    const user = mongoose.model('User', UserSchema);
    return user.create(data);
  }
}
