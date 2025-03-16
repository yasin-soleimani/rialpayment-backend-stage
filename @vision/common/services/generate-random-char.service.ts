import { roundFloor } from "@vision/common/utils/round.util";

export function generateRandomChar(count: number){

  let _sym = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ1234567890';
  let str = '';

  for( let i=0; i < count; i++ ) {
    str += _sym[roundFloor(Math.random() * (_sym.length)) ];
  }

  return str;
}