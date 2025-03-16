import * as momentjs from 'jalali-moment';

export function AutoReverseTime() {
  const start = momentjs().startOf('day');
  const now = momentjs().subtract(10, 'minute');

  return {
    start: start,
    now: now,
  };
}
