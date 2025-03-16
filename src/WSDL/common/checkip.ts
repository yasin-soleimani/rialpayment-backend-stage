import { isEmpty } from '@vision/common/utils/shared.utils';

export function checkip(data, ip) {
  for (const info of data) {
    if (info == ip) return true;
  }
  return false;
}

export function getIp(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
}

export function globalIpCheck(terminalInfo, ip) {
  const ipData = getTerminalIps(terminalInfo);

  return checkip(ipData, ip);
}

function getTerminalIps(terminalInfo) {
  let tmpArray = Array();

  for (let i = 1; i < 6; i++) {
    switch (true) {
      case i == 1 && !isEmpty(terminalInfo.ip): {
        tmpArray.push(terminalInfo.ip);
        break;
      }

      case i == 2 && !isEmpty(terminalInfo.ip2): {
        tmpArray.push(terminalInfo.ip2);
        break;
      }

      case i == 3 && !isEmpty(terminalInfo.ip3): {
        tmpArray.push(terminalInfo.ip3);
        break;
      }

      case i == 4 && !isEmpty(terminalInfo.ip4): {
        tmpArray.push(terminalInfo.ip4);
        break;
      }

      case i == 5 && !isEmpty(terminalInfo.ip5): {
        tmpArray.push(terminalInfo.ip5);
        break;
      }
    }
  }

  return tmpArray;
}
