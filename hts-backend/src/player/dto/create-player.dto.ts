export class CreatePlayerDto {
    username: string;
    session: string;
}

export class CreatePlayerSesssionDto extends CreatePlayerDto {
    code: string;
}
