import { Test, TestingModule } from '@nestjs/testing';
import { AleasService } from './aleas.service';

describe('AleasService', () => {
  let service: AleasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AleasService],
    }).compile();

    service = module.get<AleasService>(AleasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
