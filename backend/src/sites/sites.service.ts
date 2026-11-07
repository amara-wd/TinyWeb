
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

import { Site, SiteDocument } from './schemas/site.schema';
import { Person, PersonDocument } from '../people/schemas/person.schema';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<SiteDocument>,

    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

  async findAll() {
    return this.siteModel
      .find()
      .populate('authorId', 'name')
      .select('-html')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByAddress(address: string) {
    const normalizedAddress = address.trim().toLowerCase();

    const site = await this.siteModel
      .findOne({ address: normalizedAddress })
      .populate('authorId', 'name')
      .lean();

    if (!site) {
      throw new NotFoundException(
        `No website exists at ${normalizedAddress}`,
      );
    }

    return site;
  }

  async create(dto: CreateSiteDto) {
    const address = dto.address.trim().toLowerCase();

    if (!/^[a-z0-9-]+\.zz$/.test(address)) {
      throw new BadRequestException(
        'Address must be a valid .zz address',
      );
    }

    const existing = await this.siteModel.findOne({ address });

    if (existing) {
      throw new ConflictException(
        'This address is already registered',
      );
    }

    const author = await this.personModel.findById(dto.authorId);

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Sanitize untrusted HTML before storing it.
    const sanitizedHtml = sanitizeHtml(dto.html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img',
        'h1',
        'h2',
        'h3',
        'h4',
        'section',
        'article',
        'main',
        'header',
        'footer',
        'nav',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'width', 'height'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowProtocolRelative: false,
    });

    // Extract searchable text from the sanitized HTML.
    const $ = cheerio.load(sanitizedHtml);

    $('script, style, noscript, template').remove();

    const searchableText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const site = await this.siteModel.create({
        address,
        title: dto.title.trim(),
        html: sanitizedHtml,
        searchableText,
        authorId: new Types.ObjectId(dto.authorId),
      });

      return site;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          'This address is already registered',
        );
      }

      throw error;
    }
  }
}
