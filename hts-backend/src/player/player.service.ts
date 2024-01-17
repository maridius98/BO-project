import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlayerDto, CreatePlayerSesssionDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './entities/player.entity';
import { Model } from 'mongoose';
import { SessionService } from 'src/session/session.service';
import { Session } from 'src/session/entities/session.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('Player') private readonly model: Model<Player>,
    private readonly sessionService: SessionService
  ){}

  async create(createPlayerDto: CreatePlayerSesssionDto) {
    let session: Session;
    if (!createPlayerDto.session) {
      createPlayerDto.session = (session = await this.sessionService.create(createPlayerDto.code))._id;
    } else if (!(session = await this.sessionService.findOne(createPlayerDto.session)).$isEmpty) {
      throw new NotFoundException("Session not found");
    }
    const newPlayer = new this.model(createPlayerDto);
    session.players.push(newPlayer);
    await session.save();
    return await newPlayer.save();
  }
  
  async findAll() {
    return await this.model.find();
  }

  async findOne(id: string) {
    return await this.model.findById(id);
  }

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
