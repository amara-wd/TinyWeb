
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { NavigationMethod } from '../schemas/visit.schema';

export class CreateVisitDto {
  @IsMongoId()
  personId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(253)
  address!: string;

  @IsEnum(NavigationMethod)
  method!: NavigationMethod;
}
