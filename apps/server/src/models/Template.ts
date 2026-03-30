import mongoose, { Schema, Document } from 'mongoose';
import { ITemplate } from '@boulot/types';

export interface ITemplateDocument extends Omit<ITemplate, '_id'>, Document {}

// Keep runtime-safe enum values locally in server model.
// The shared @boulot/types package compiles to dist and may lag during dev.
const TEMPLATE_CATEGORIES = ['WEB', 'MOBILE', 'DATA', 'AI', 'DEVOPS', 'DESIGN'] as const;

const TemplateSchema = new Schema<ITemplateDocument>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, enum: TEMPLATE_CATEGORIES, required: true },
    skillsRequired: [{ type: String }],
    estimatedDays: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    repositoryTemplate: { type: String },
  },
  { timestamps: true }
);

export const TemplateModel = mongoose.model<ITemplateDocument>('Template', TemplateSchema);
