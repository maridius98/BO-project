import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './entities/player.entity';
import { Model } from 'mongoose';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('Player') private readonly model: Model<Player>
  ){}

  create(createPlayerDto: CreatePlayerDto) {
    return this.model.create({createPlayerDto})
  }

  async findAll() {
    return await this.model.find();
  }

  async findOne(id: number) {
    return await this.model.findById(id);
  }

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
