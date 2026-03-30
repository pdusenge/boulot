import { ApplicationService } from './application.service';
import { ApplicationStatus, ProjectStatus, UserRole } from '@boulot/types';

function makeService(overrides?: Partial<ConstructorParameters<typeof ApplicationService>[0]>) {
  const applicationRepo: any = {
    findByProjectAndStudent: jest.fn(),
    countByStudentSince: jest.fn(),
    countByProject: jest.fn(),
    create: jest.fn(),
    listByProject: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    bulkRejectProjectApplicants: jest.fn(),
  };
  const projectRepo: any = {
    findById: jest.fn(),
  };
  const portfolioRepo: any = {
    findByStudent: jest.fn(),
    findManyByStudentIds: jest.fn(),
  };
  const userRepo: any = {
    findById: jest.fn(),
  };

  const service = new ApplicationService({
    applicationRepo,
    projectRepo,
    portfolioRepo,
    userRepo,
    ...(overrides || {}),
  });

  return { service, applicationRepo, projectRepo, portfolioRepo, userRepo };
}

describe('ApplicationService.submitApplication', () => {
  test('blocks if already applied', async () => {
    const { service, applicationRepo, projectRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null });
    applicationRepo.findByProjectAndStudent.mockResolvedValue({ _id: 'a1' });

    await expect(service.submitApplication('s1', { projectId: 'p1' })).rejects.toThrow(/already applied/i);
  });

  test('blocks if github not connected', async () => {
    const { service, applicationRepo, projectRepo, userRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: undefined });

    await expect(service.submitApplication('s1', { projectId: 'p1' })).rejects.toThrow(/GitHub must be connected/i);
  });

  test('blocks if no completed projects on custom project', async () => {
    const { service, applicationRepo, projectRepo, userRepo, portfolioRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: 'x' });
    portfolioRepo.findByStudent.mockResolvedValue({ totalCompleted: 0, completionRate: 0, completedProjects: [], skillBadges: [] });

    await expect(service.submitApplication('s1', { projectId: 'p1' })).rejects.toThrow(/template project/i);
  });

  test('allows new student to apply to template project', async () => {
    const { service, applicationRepo, projectRepo, userRepo, portfolioRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null, templateId: 't1', skillsRequired: ['react'] });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: 'x' });
    portfolioRepo.findByStudent.mockResolvedValue({ totalCompleted: 0, completionRate: 0, completedProjects: [], skillBadges: [{ skill: 'react' }] });
    applicationRepo.countByStudentSince.mockResolvedValue(0);
    applicationRepo.countByProject.mockResolvedValue(0);
    applicationRepo.create.mockImplementation(async (x: any) => x);

    const created: any = await service.submitApplication('s1', {
      projectId: 'p1',
      timeline: 7,
      proposalText: 'a'.repeat(200),
      githubLinks: [],
    });

    expect(created.status).toBe(ApplicationStatus.PENDING);
  });

  test('enforces daily limit', async () => {
    const { service, applicationRepo, projectRepo, userRepo, portfolioRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: 'x' });
    portfolioRepo.findByStudent.mockResolvedValue({ totalCompleted: 1, completionRate: 100, completedProjects: [], skillBadges: [] });
    applicationRepo.countByStudentSince.mockResolvedValue(5);

    await expect(service.submitApplication('s1', { projectId: 'p1', proposalText: 'a'.repeat(120), githubLinks: [], timeline: 3 })).rejects.toThrow(
      /Daily limit reached/i
    );
  });

  test('enforces per-project limit', async () => {
    const { service, applicationRepo, projectRepo, userRepo, portfolioRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: 'x' });
    portfolioRepo.findByStudent.mockResolvedValue({ totalCompleted: 1, completionRate: 100, completedProjects: [], skillBadges: [] });
    applicationRepo.countByStudentSince.mockResolvedValue(0);
    applicationRepo.countByProject.mockResolvedValue(15);

    await expect(service.submitApplication('s1', { projectId: 'p1', proposalText: 'a'.repeat(120), githubLinks: [], timeline: 3 })).rejects.toThrow(
      /maximum of 15 applications/i
    );
  });

  test('creates application with pending status and computed score', async () => {
    const { service, applicationRepo, projectRepo, userRepo, portfolioRepo } = makeService();
    projectRepo.findById.mockResolvedValue({ _id: 'p1', status: ProjectStatus.OPEN, assignedStudentId: null, skillsRequired: ['react'] });
    applicationRepo.findByProjectAndStudent.mockResolvedValue(null);
    userRepo.findById.mockResolvedValue({ _id: 's1', role: UserRole.STUDENT, githubUsername: 'x' });
    portfolioRepo.findByStudent.mockResolvedValue({
      totalCompleted: 1,
      completionRate: 80,
      completedProjects: [{ rating: 5 }],
      skillBadges: [{ skill: 'react' }],
    });
    applicationRepo.countByStudentSince.mockResolvedValue(0);
    applicationRepo.countByProject.mockResolvedValue(0);
    applicationRepo.create.mockImplementation(async (x: any) => x);

    const created: any = await service.submitApplication('s1', {
      projectId: 'p1',
      timeline: 7,
      proposalText: 'a'.repeat(200),
      githubLinks: ['https://github.com/x/y'],
    });

    expect(created.status).toBe(ApplicationStatus.PENDING);
    expect(typeof created.score).toBe('number');
    expect(created.score).toBeGreaterThan(0);
  });
});

