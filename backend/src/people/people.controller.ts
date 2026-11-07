
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('people')
export class PeopleController {
  constructor(
    private readonly peopleService: PeopleService,
  ) {}

  @Get()
  findAll() {
    return this.peopleService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePersonDto) {
    return this.peopleService.create(dto);
  }
}
