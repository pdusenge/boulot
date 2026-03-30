import { ProjectStatus, ProposalStatus, UserRole } from '@boulot/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Student Developer',
  [UserRole.SME]: 'Small/Medium Enterprise',
  [UserRole.MENTOR]: 'Technical Mentor',
  [UserRole.ADMIN]: 'Platform Admin',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.OPEN]: 'Open for Proposals',
  [ProjectStatus.IN_PROGRESS]: 'In Progress',
  [ProjectStatus.IN_REVIEW]: 'In Mentor Review',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.CANCELLED]: 'Cancelled',
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  [ProposalStatus.PENDING]: 'Pending',
  [ProposalStatus.ACCEPTED]: 'Accepted',
  [ProposalStatus.REJECTED]: 'Rejected',
};
