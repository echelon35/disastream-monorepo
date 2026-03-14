import { Test, TestingModule } from '@nestjs/testing';
import { EarthquakesService } from './earthquakes.service';

describe('SeismesService', () => {
  let service: EarthquakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EarthquakesService],
    }).compile();

    service = module.get<EarthquakesService>(EarthquakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
