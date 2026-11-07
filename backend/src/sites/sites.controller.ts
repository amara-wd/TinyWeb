
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';

import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
  ) {}

  @Get()
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':address')
  findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }
}
