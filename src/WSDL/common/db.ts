import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/nest');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
  // we're connected!
  console.log('Connected to MongoDB database');
});
export const dbConnection = db;
