import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto';
import { Card } from 'src/card/entities/card.entity';
import { ObjectId } from 'mongoose';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
  _id?: string | ObjectId;
  hand: Card[];
  field: Card[];
}
