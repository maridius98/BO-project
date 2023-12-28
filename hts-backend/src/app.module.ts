import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionModule } from './session/session.module';
import { PlayerModule } from './player/player.module';
import { CardModule } from './card/card.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    SessionModule,
    PlayerModule,
    CardModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27019')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
