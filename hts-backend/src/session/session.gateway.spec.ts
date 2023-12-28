import { Test, TestingModule } from '@nestjs/testing';
import { SessionGateway } from './session.gateway';
import { SessionService } from './session.service';

describe('SessionGateway', () => {
  let gateway: SessionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionGateway, SessionService],
    }).compile();

    gateway = module.get<SessionGateway>(SessionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
