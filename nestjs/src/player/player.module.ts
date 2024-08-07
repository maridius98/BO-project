import { Module, forwardRef } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerGateway } from './player.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from './entities/player.entity';
import { PlayerController } from './player.controller';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }]),
    forwardRef(() => SessionModule),
  ],
  providers: [PlayerGateway, PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService],
})
export class PlayerModule {}
