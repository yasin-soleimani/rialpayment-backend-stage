import { GetTaxiInformationDto } from '../../../Core/taxi/dto/taxi-get-information.dto';
import { Taxi } from '../../../Core/taxi/interfaces/taxi.interface';

/**
 * returns qr Data seperated by instituteId and terminalId only if the presented string is a valid Taxi QR barcode
 * @param barcode decoded QR barcode data
 * @returns {boolean}
 */
export const checkTaxiBarcode = (barcode: GetTaxiInformationDto): boolean => {
  if (!barcode) return null;

  if (Number.isNaN(Number(barcode.i)) || Number.isNaN(Number(barcode.t))) return null;

  // check if scanned barcode is a taxi barcode
  const isTaxi = barcode.i === '10';
  return isTaxi;
};

export const normalizeGetTaxiInformationData = (
  dto: GetTaxiInformationDto,
  userId: string,
  taxiInformation = null,
  referrer
): Pick<Taxi, 'terminalID' | 'instituteId' | 'user' | 'taxiInformation' | 'referrer'> => {
  return {
    instituteId: parseInt(dto.i),
    terminalID: parseInt(dto.t),
    user: userId,
    taxiInformation: taxiInformation,
    referrer,
  };
};

function luhn_checksum(code: string): number {
  var len = code.length;
  var parity = len % 2;
  var sum = 0;
  for (var i = len - 1; i >= 0; i--) {
    var d = parseInt(code.charAt(i));
    if (i % 2 == parity) {
      d *= 2;
    }
    if (d > 9) {
      d -= 9;
    }
    sum += d;
  }
  return sum % 10;
}

/* luhn_calculate
 *  * Return a full code (including check digit), from the specified partial code (without check digit).
 *   */
export function generateSepidPan(partcode: string): string | false {
  if (partcode.length !== 9) return false;
  const sepidBin = process.env.FAVA_LUHN_BIN;
  const toBeLuhnChecked = sepidBin + partcode;
  const checksum = luhn_checksum(toBeLuhnChecked + '0');
  const controlChecksum = checksum === 0 ? 0 : 10 - checksum;

  return toBeLuhnChecked + controlChecksum;
}
