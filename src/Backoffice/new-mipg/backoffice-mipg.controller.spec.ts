import { Test, TestingModule } from '@nestjs/testing';
import { BackofficeMipgController } from './backoffice-mipg.controller';

describe('ActivateMipgController', () => {
  let controller: BackofficeMipgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackofficeMipgController],
    }).compile();

    controller = module.get<BackofficeMipgController>(BackofficeMipgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
