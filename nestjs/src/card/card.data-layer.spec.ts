import { Test, TestingModule } from '@nestjs/testing';
import { CardDataLayer } from './card.data-layer';

describe('CardDataLayer', () => {
  let service: CardDataLayer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardDataLayer],
    }).compile();

    service = module.get<CardDataLayer>(CardDataLayer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
