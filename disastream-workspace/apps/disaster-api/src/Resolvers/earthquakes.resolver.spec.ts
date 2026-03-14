import { Test, TestingModule } from '@nestjs/testing';
import { SeismesResolver } from './seismes.resolver';

describe('SeismesResolver', () => {
  let resolver: SeismesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeismesResolver],
    }).compile();

    resolver = module.get<SeismesResolver>(SeismesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
