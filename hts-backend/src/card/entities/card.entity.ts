import { SchemaFactory } from "@nestjs/mongoose";

export class Card {}

export const CardSchema = SchemaFactory.createForClass(Card);