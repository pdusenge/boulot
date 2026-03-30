import { Request, Response } from 'express';
import { TemplateService } from './template.service';

const templateService = new TemplateService();

export const listTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const templates = category
      ? await templateService.getByCategory(category as string)
      : await templateService.listTemplates();
    res.status(200).json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getTemplate = async (req: Request, res: Response) => {
  try {
    const template = await templateService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(200).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const created = await templateService.createTemplate(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create template' });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const updated = await templateService.updateTemplate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const deleted = await templateService.deleteTemplate(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(200).json({ success: true, data: deleted });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to delete template' });
  }
};
