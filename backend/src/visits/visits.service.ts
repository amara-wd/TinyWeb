
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Visit, VisitDocument, VisitStatus } from './schemas/visit.schema';
import { Site, SiteDocument } from '../sites/schemas/site.schema';
import { Person, PersonDocument } from '../people/schemas/person.schema';

import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name)
    private readonly visitModel: Model<VisitDocument>,

    @InjectModel(Site.name)
    private readonly siteModel: Model<SiteDocument>,

    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

  async create(dto: CreateVisitDto) {
    const address = dto.address.trim().toLowerCase();

    if (!/^[a-z0-9-]+\.zz$/.test(address)) {
      throw new BadRequestException('Invalid .zz address');
    }

    const person = await this.personModel.findById(dto.personId);

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const site = await this.siteModel.findOne({ address });

    const visit = await this.visitModel.create({
      personId: new Types.ObjectId(dto.personId),
      address,
      siteId: site?._id ?? null,
      title: site?.title,
      method: dto.method,
      status: site ? VisitStatus.FOUND : VisitStatus.NOT_FOUND,
      visitedAt: new Date(),
    });

    return visit;
  }

  async findByPerson(personId: string, limit = 100) {
    if (!Types.ObjectId.isValid(personId)) {
      throw new BadRequestException('Invalid person ID');
    }

    const person = await this.personModel.findById(personId);

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    const safeLimit = Math.min(Math.max(limit, 1), 200);

    return this.visitModel
      .find({ personId: new Types.ObjectId(personId) })
      .sort({ visitedAt: -1 })
      .limit(safeLimit)
      .lean();
  }
}
