import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionService } from './session.service';
import { SessionGateway } from './session.gateway';
import { SessionSchema } from './entities/session.entity';
import { SessionController } from './session.controller';
import { PlayerModule } from 'src/player/player.module';
import { SessionDataLayer } from './session.data-layer';
import { CardModule } from 'src/card/card.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
    forwardRef(() => PlayerModule),
    CardModule,
  ],
  providers: [SessionGateway, SessionService, SessionDataLayer],
  controllers: [SessionController],
  exports: [SessionService, SessionDataLayer],
})
export class SessionModule {}
