
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

import { Site, SiteSchema } from '../sites/schemas/site.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
