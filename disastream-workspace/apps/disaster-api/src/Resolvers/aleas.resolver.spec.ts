import { Test, TestingModule } from '@nestjs/testing';
import { AleasResolver } from './aleas.resolver';

describe('AleasResolver', () => {
  let resolver: AleasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AleasResolver],
    }).compile();

    resolver = module.get<AleasResolver>(AleasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
