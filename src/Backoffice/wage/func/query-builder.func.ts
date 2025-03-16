import { BackofficeWageDto } from '../dto/wage.dto';

export function BackofficeWageQueryBuilder(data: BackofficeWageDto) {
  let query = Array();

  query.push({
    createdAt: { $gte: new Date(Number(data.from)), $lte: new Date(Number(data.to)) },
  });

  if (data.type) {
    query.push({
      type: Number(data.type),
    });
  }

  if (query.length < 2) {
    return query[0];
  }

  return {
    $and: query,
  };
}
