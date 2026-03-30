import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { ApplicationService } from '../application/application.service';

const projectService = new ProjectService();
const applicationService = new ApplicationService();

export const createProject = async (req: Request, res: Response) => {
  try {
    const smeId = req.user!.userId;
    const project = await projectService.createProject(smeId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

export const getActiveProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getActiveProjects();
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getProjectDetails = async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const smeId = req.user!.userId;
    const projects = await projectService.getProjectsBySme(smeId);
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getReviewQueue = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getReviewQueue();
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getMyWorkProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const projects = await projectService.getProjectsForUser(userId, role);
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const submitForReview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await projectService.submitForReview(req.params.id, studentId);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('in progress') || error.message.includes('unauthorized')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

export const approveProject = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user!.userId;
    const { feedback } = req.body;
    const project = await projectService.approveProject(req.params.id, mentorId, feedback);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const rejectProject = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user!.userId;
    const { feedback } = req.body;
    const project = await projectService.rejectProject(req.params.id, mentorId, feedback);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const assignMentor = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) {
      return res.status(400).json({ success: false, error: 'mentorId is required' });
    }
    const project = await projectService.assignMentor(req.params.id, mentorId);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectsWithoutMentor = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getProjectsWithoutMentor();
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getMentorProjects = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user!.userId;
    const projects = await projectService.getProjectsByMentor(mentorId);
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getProjectApplications = async (req: Request, res: Response) => {
  try {
    const smeId = req.user!.userId;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const data = await applicationService.listProjectApplications({
      smeId,
      projectId: req.params.id,
      page,
      limit,
    });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
