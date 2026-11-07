
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  MaxLength,
} from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  address!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  html!: string;

  @IsMongoId()
  authorId!: string;
}
