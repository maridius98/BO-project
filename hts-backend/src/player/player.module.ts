import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerGateway } from './player.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from './entities/player.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }])],
  providers: [PlayerGateway, PlayerService],
})
export class PlayerModule {}
