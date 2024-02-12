import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('player')
export class PlayerController {
    constructor(private readonly service: PlayerService){}

    @Post()
    create(@Body() createPlayerDto: CreatePlayerDto) {
        return this.service.create(createPlayerDto);
    }

    @Get()
    async findAll(){
        return await this.service.findAll();
    }
}
