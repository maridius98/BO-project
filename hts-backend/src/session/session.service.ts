import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './entities/session.entity';
import { Model } from 'mongoose';

@Injectable()
export class SessionService {
  constructor(@InjectModel('Session') private readonly model: Model<Session>){}
  async create() {
    const newSession = new this.model(); // No need to pass in any arguments
    return await newSession.save();
  }

  async findAll() {
    return await this.model.find().exec();
  }

  async findOne(id: string) {
    return await this.model.findById(id).exec();
  }

  update(id: number, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }
}
