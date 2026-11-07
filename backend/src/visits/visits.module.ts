
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

import { Visit, VisitSchema } from './schemas/visit.schema';
import { Site, SiteSchema } from '../sites/schemas/site.schema';
import { Person, PersonSchema } from '../people/schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visit.name, schema: VisitSchema },
      { name: Site.name, schema: SiteSchema },
      { name: Person.name, schema: PersonSchema },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
