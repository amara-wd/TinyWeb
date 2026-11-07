
import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Site, SiteDocument } from '../sites/schemas/site.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<SiteDocument>,
  ) {}

  async search(query: string) {
    const q = query?.trim();

    if (!q || q.length > 200) {
      throw new BadRequestException(
        'Please provide a search query (maximum 200 characters)',
      );
    }

    const results = await this.siteModel
      .find(
        { $text: { $search: q } },
        {
          score: { $meta: 'textScore' },
        },
      )
      .sort({
        score: { $meta: 'textScore' },
      })
      .select('address title searchableText authorId')
      .populate('authorId', 'name')
      .limit(20)
      .lean();

    return results.map((site: any) => {
      const text = site.searchableText || '';
      const index = text.toLowerCase().indexOf(
        q.toLowerCase(),
      );

      const start = index >= 0
        ? Math.max(0, index - 60)
        : 0;

      return {
        _id: site._id,
        address: site.address,
        title: site.title,
        author: site.authorId,
        score: site.score,
        snippet: text.slice(start, start + 180),
      };
    });
  }
}
