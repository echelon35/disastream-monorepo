import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from './alert.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alert } from '../Domain/alert.model';
import { Repository } from 'typeorm';
import { Earthquake } from '@disastream/models';
import { EmailerService } from './emailer.service';
import { CustomLogger } from './logger.service';

describe('AlertService', () => {
  let service: AlertService;
  let repository: Repository<Alert>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    process.env.MAILJET_API_KEY = 'test_key';
    process.env.MAILJET_API_SECRET = 'test_secret';
    process.env.TEMPLATE_ID_ALERT = '1111111';
    process.env.TEMPLATE_ID_ALERT_EXPIRATION = '2222222';
    process.env.DISASTREAM_FRONT_BASE_URI = 'http://localhost:4200';
    process.env.DISASTREAM_MAIL = 'no-reply@disastream.test';
    process.env.ENVIRONMENT = 'dev';

    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      find: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailerService,
        CustomLogger,
        AlertService,
        {
          provide: getRepositoryToken(Alert),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AlertService>(AlertService);
    repository = module.get<Repository<Alert>>(getRepositoryToken(Alert));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filterAlertsByCriterias', () => {
    it('should return true/include alert if no criteria are defined', async () => {
      const alert = new Alert();
      alert.criterias = JSON.parse('[]'); // or empty array
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const alert2 = new Alert();
      alert2.criterias = JSON.parse('[]'); // or empty array
      const disaster2 = new Earthquake();
      disaster2.magnitude = 2;

      const result = await service.filterAlertsByCriterias(
        [alert, alert2],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(2);
    });

    it('should return true/include alert if criteria for other alea type', async () => {
      const alert = new Alert();
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'hurricane',
            field: 'Catégorie',
            operator: '>',
            value: 1,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(1);
    });

    it('should filter correctly with > operator (Match)', async () => {
      const alert = new Alert();
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '>',
            value: 4,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(1);
    });

    it('should filter correctly with > operator (No Match)', async () => {
      const alert = new Alert();
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'magnitude',
            operator: '>',
            value: 5,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 4.5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(0);
    });

    it('should filter correctly with = operator', async () => {
      const alert = new Alert();
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '=',
            value: 5,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(1);
    });

    it('should filter correctly with multiple criteria (AND logic)', async () => {
      const alert = new Alert();
      // Mag > 4 AND Mag < 6 -> 5 fits
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '>',
            value: 4,
          },
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '<',
            value: 6,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty if one of multiple criteria fails', async () => {
      const alert = new Alert();
      // Mag > 4 AND Mag > 6 -> 5 fails
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '>',
            value: 4,
          },
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '>',
            value: 6,
          },
        ]),
      );
      const disaster = new Earthquake();
      disaster.magnitude = 5;

      const result = await service.filterAlertsByCriterias(
        [alert],
        disaster,
        'earthquake',
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('findUserToAlert', () => {
    it('should call repository and then filter', async () => {
      const disaster = new Earthquake();
      disaster.point = { type: 'Point', coordinates: [0, 0] };
      disaster.magnitude = 5;

      const alert = new Alert();
      alert.criterias = JSON.parse(
        JSON.stringify([
          {
            aleaName: 'earthquake',
            field: 'Magnitude',
            operator: '>',
            value: 4,
          },
        ]),
      );

      // Override the mock return value for this test
      mockQueryBuilder.getMany.mockResolvedValue([alert]);

      const result = await service.findUserToAlert('earthquake', disaster);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(alert);
    });

    it('should return empty if repository returns empty', async () => {
      const disaster = new Earthquake();
      disaster.point = { type: 'Point', coordinates: [0, 0] };

      const result = await service.findUserToAlert('earthquake', disaster);

      expect(result).toHaveLength(0);
    });
  });

  describe('findExpiredAlerts', () => {
    it('should find expired alerts and send emails', async () => {
      const expiredAlert = new Alert();
      expiredAlert.id = 1;
      expiredAlert.name = 'Test Alert';
      expiredAlert.expirationDate = new Date(Date.now() - 60000);
      expiredAlert.isActivate = true;
      expiredAlert.mailAlerts = [{ mail: 'user@test.dev' }] as any;

      const sendEmailSpy = jest
        .spyOn(service['emailerService'], 'sendTemplateEmail')
        .mockResolvedValue(undefined as never);
      jest
        .spyOn(repository, 'find')
        .mockResolvedValue([expiredAlert] as Alert[]);

      await service.CheckForExpiredAlerts();

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          isActivate: true,
          expirationDate: expect.any(Object),
        },
        relations: ['mailAlerts'],
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expiredAlert.id,
          isActivate: false,
        }),
      );
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.dev',
          templateId: 2222222,
        }),
      );
    });
  });
});
