import { Test, TestingModule } from '@nestjs/testing';
import { SimcardService } from './simcard.service';

describe('SimcardService', () => {
  let service: SimcardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimcardService],
    }).compile();

    service = module.get<SimcardService>(SimcardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
