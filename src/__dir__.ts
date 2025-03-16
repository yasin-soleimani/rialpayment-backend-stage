import * as path from 'path';
import * as fs from 'fs';

export const APP_DIR = __dirname;

let publicDir = path.join(APP_DIR, '../', '../', 'public');
if (!fs.existsSync(publicDir)) {
  publicDir = path.join(APP_DIR, '../', 'public');
  console.log('public dir:', publicDir);
}
export const PUBLIC_DIR = publicDir;

let uploadDir = path.join(APP_DIR, '../', 'public', 'upload', '/');
if (!fs.existsSync(uploadDir)) {
  uploadDir = path.join(APP_DIR, '../', '../', 'public', 'upload', '/');
  console.log('upload dir:', uploadDir);
}
export const UPLOAD_URI = uploadDir;
let uploadDirUser = path.join(APP_DIR, '../', 'public', 'users', '/');
if (!fs.existsSync(uploadDirUser)) {
  uploadDirUser = path.join(APP_DIR, '../', '../', 'public', 'users', '/');
  console.log('upload dir user:', uploadDirUser);
}
export const UPLOAD_URI_USERS = uploadDirUser;
