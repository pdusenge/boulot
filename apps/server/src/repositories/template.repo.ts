import { TemplateModel, ITemplateDocument } from '../models/Template';

export class TemplateRepository {
  async findAll(): Promise<ITemplateDocument[]> {
    return TemplateModel.find().sort({ category: 1, name: 1 });
  }

  async findById(id: string): Promise<ITemplateDocument | null> {
    return TemplateModel.findById(id);
  }

  async create(data: Partial<ITemplateDocument>): Promise<ITemplateDocument> {
    return TemplateModel.create(data);
  }

  async findByCategory(category: string): Promise<ITemplateDocument[]> {
    return TemplateModel.find({ category });
  }

  async updateById(id: string, data: Partial<ITemplateDocument>): Promise<ITemplateDocument | null> {
    return TemplateModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteById(id: string): Promise<ITemplateDocument | null> {
    return TemplateModel.findByIdAndDelete(id);
  }
}
