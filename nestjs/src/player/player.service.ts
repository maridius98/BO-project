import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './entities/player.entity';
import { Model } from 'mongoose';
import { SessionService } from 'src/session/session.service';
import { Session } from 'src/session/entities/session.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('Player') 
    private readonly model: Model<Player>,

    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService
  ){};

  async create(createPlayerDto: CreatePlayerDto) {
    let session: Session;
    if (!createPlayerDto.code) {
      session = await this.sessionService.create();
    } else {
      session = await this.sessionService.findByCode(createPlayerDto.code);
    }
    createPlayerDto.session = session;
    const player = new this.model(createPlayerDto);
    session.players.push(player);
    await session.save();
    return await player.save();
  }
  
  async findAll() {
    return await this.model.find();
  }

  async findOne(id: string) {
    return await this.model.findById(id);
  }

  update(id: string, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: string) {
    return `This action removes a #${id} player`;
  }
}
