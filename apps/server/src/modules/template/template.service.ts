import { TemplateRepository } from '../../repositories/template.repo';
import { ITemplateDocument } from '../../models/Template';

export class TemplateService {
  private templateRepo: TemplateRepository;

  constructor() {
    this.templateRepo = new TemplateRepository();
  }

  async listTemplates(): Promise<ITemplateDocument[]> {
    return this.templateRepo.findAll();
  }

  async getTemplate(id: string): Promise<ITemplateDocument | null> {
    return this.templateRepo.findById(id);
  }

  async getByCategory(category: string): Promise<ITemplateDocument[]> {
    return this.templateRepo.findByCategory(category);
  }

  async createTemplate(data: any): Promise<ITemplateDocument> {
    return this.templateRepo.create(data);
  }

  async updateTemplate(id: string, data: any): Promise<ITemplateDocument | null> {
    return this.templateRepo.updateById(id, data);
  }

  async deleteTemplate(id: string): Promise<ITemplateDocument | null> {
    return this.templateRepo.deleteById(id);
  }
}
