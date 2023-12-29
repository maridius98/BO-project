import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('session')
export class SessionController {
    constructor(private readonly service: SessionService) {}

    @Post()
    async create() {
      return await this.service.create();
    }
  
    @Get()
    async findAll() {
      return await this.service.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return await this.service.findOne(id);
    }
}
