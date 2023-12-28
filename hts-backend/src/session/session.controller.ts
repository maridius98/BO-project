import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('session')
export class SessionController {
    constructor(private readonly service: SessionService) {}

    @Post()
    create(@Body() dto: CreateSessionDto) {
      return this.service.create(dto);
    }
  
    @Get()
    findAll() {
      return this.service.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.service.findOne(+id);
    }
}
