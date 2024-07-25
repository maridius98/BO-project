import { Session } from 'src/session/entities/session.entity';

export class CreatePlayerDto {
  username: string;
  session?: string | Session;
  code?: string;
  isHost: boolean = false;
}
