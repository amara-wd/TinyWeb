
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

import { Site, SiteSchema } from './schemas/site.schema';
import { Person, PersonSchema } from '../people/schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Person.name, schema: PersonSchema },
    ]),
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
