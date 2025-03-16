import * as crypto from 'crypto';

export const encryptionString = function (str: string, key: string) {
  try {
    const hashStr = hash(key);
    const key2 = hashStr.substr(0, 32);
    const iv = hashStr.substr(32, 16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key2), iv);
    let encrypted = cipher.update(str, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    console.log('cypher::::::::::::::', url64Encode(encrypted));
    return url64Encode(encrypted);
  } catch (e) {
    console.log(e);
    return '';
  }
};

export const decryptionString = function (str: string, key: string) {
  try {
    console.log('decipher:::::::::::::', str);
    str = url64Decode(str);
    const hashStr = hash(key);
    const key2 = hashStr.substr(0, 32);
    const iv = hashStr.substr(32, 16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key2), iv);
    let decrypted = decipher.update(str, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.log(e);
    return '';
  }
};

export const url64Encode = function (unencoded) {
  try {
    return unencoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  } catch (e) {
    return '';
  }
};
export const hash = (str) => {
  try {
    return crypto.createHmac('sha256', 'aRxckgekl35l3234#%k').update(str).digest('hex');
  } catch (e) {
    return '';
  }
};

export const url64Decode = function (encoded) {
  try {
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4) encoded += '=';
    return encoded;
  } catch (e) {
    return '';
  }
};
