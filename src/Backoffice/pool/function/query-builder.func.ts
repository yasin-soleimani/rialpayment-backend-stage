import { BackofficePoolFilterDto } from '../dto/pool.dto';
export function BackofficePoolFilterQueryBuilder(getInfo: BackofficePoolFilterDto) {
  if (getInfo.user.length > 0) {
    return { user: getInfo.user };
  } else {
    {
    }
  }
}
