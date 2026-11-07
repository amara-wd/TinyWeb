
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
  ) {}

  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Get(':personId')
  findByPerson(
    @Param('personId') personId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe)
    limit: number,
  ) {
    return this.visitsService.findByPerson(personId, limit);
  }
}
