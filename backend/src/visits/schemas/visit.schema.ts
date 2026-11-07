
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

export enum NavigationMethod {
  TYPED = 'typed',
  LINK = 'link',
  BACK = 'back',
  FORWARD = 'forward',
  HISTORY = 'history',
  SEARCH = 'search',
}

export enum VisitStatus {
  FOUND = 'found',
  NOT_FOUND = 'not_found',
}

@Schema({ timestamps: true })
export class Visit {
  @Prop({
    type: Types.ObjectId,
    ref: 'Person',
    required: true,
  })
  personId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Site',
    default: null,
  })
  siteId!: Types.ObjectId | null;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  })
  address!: string;

  @Prop({ type: String })
  title?: string;

  @Prop({
    type: String,
    required: true,
    enum: NavigationMethod,
  })
  method!: NavigationMethod;

  @Prop({
    type: String,
    required: true,
    enum: VisitStatus,
  })
  status!: VisitStatus;

  @Prop({ type: Date, default: Date.now })
  visitedAt!: Date;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

VisitSchema.index({ personId: 1, visitedAt: -1 });
