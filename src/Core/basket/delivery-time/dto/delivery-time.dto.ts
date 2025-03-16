export class BasketDeliveryTimeDto {
  day: number;
  status: boolean;
  startTime: string;
  endTime: string;
  capacity: number;
}

export type UpdateDeliveryTimeDto = Partial<Pick<BasketDeliveryTimeDto, 'status' | 'capacity'>>;
