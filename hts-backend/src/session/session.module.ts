import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionService } from './session.service';
import { SessionGateway } from './session.gateway';
import { SessionSchema } from './entities/session.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }])],
  providers: [SessionGateway, SessionService],
})
export class SessionModule {}
