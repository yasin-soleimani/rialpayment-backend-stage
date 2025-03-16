import { Connection } from 'mongoose';
import { fileManagerSchema } from './schemas/file-manager.schema';

export const FileManagerProviders = [
  {
    provide: 'FileManagerModel',
    useFactory: (connection: Connection) => connection.model('FileManager', fileManagerSchema),
    inject: ['DbConnection'],
  },
];
