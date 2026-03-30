export enum UserRole {
  STUDENT = 'STUDENT',
  SME = 'SME',
  MENTOR = 'MENTOR',
  ADMIN = 'ADMIN'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  ESCROWED = 'ESCROWED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED'
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum StudentTier {
  APPRENTICE = 'APPRENTICE',
  INTERMEDIATE = 'INTERMEDIATE',
  PRO = 'PRO'
}

export enum TemplateCategory {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  DATA = 'DATA',
  AI = 'AI',
  DEVOPS = 'DEVOPS',
  DESIGN = 'DESIGN'
}