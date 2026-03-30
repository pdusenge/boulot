import { TemplateCategory } from "./enums";


export interface ITemplate {
  _id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  skillsRequired: string[];
  estimatedDays: number;
  basePrice: number;
  repositoryTemplate?: string; // GitHub template repo URL
  createdAt: Date;
  updatedAt: Date;
}
