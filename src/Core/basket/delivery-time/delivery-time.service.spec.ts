import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryTimeService } from './delivery-time.service';

describe('DeliveryTimeService', () => {
  let service: DeliveryTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryTimeService],
    }).compile();

    service = module.get<DeliveryTimeService>(DeliveryTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
