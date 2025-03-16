import { Test, TestingModule } from '@nestjs/testing';
import { ActivateMipgService } from './activate-mipg.service';

describe('ActivateMipgService', () => {
  let service: ActivateMipgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivateMipgService],
    }).compile();

    service = module.get<ActivateMipgService>(ActivateMipgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
