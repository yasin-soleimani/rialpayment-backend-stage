import * as mongoose from 'mongoose';
import * as process from 'process';

export const databaseProviders = [
  {
    provide: 'DbConnection',
    useFactory: async () => {
      (mongoose as any).Promise = global.Promise;
      mongoose.set('useFindAndModify', false);
      return await mongoose.connect(process.env.MONGO_DB_URL, {
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });
    },
  },
];
