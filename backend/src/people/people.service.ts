
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Person, PersonDocument } from './schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<PersonDocument>,
  ) {}

  async findAll() {
    return this.personModel
      .find()
      .sort({ name: 1 })
      .lean();
  }

  async create(dto: CreatePersonDto) {
    const name = dto.name.trim();

    const existing = await this.personModel.findOne({ name });

    if (existing) {
      throw new ConflictException('This person already exists');
    }

    return this.personModel.create({ name });
  }
}
