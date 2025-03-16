export function getMacAddress(mac) {
  const maci = mac;
  const index = maci.length - 17;
  const data = maci.substr(index);

  const regex = /^[a-zA-z0-9]{2}:[a-zA-z0-9]{2}:[a-zA-z0-9]{2}:[a-zA-z0-9]{2}:[a-zA-z0-9]{2}:[a-zA-z0-9]{2}/;
  if( regex.test(data) ) {
    return data;
  } else {
    return mac
  }
}