
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;
}
