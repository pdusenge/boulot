import { z } from 'zod';
import { UserRole, TemplateCategory } from '@boulot/types';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.enum([UserRole.STUDENT, UserRole.SME, UserRole.MENTOR]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Project Schemas
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.number().min(10, 'Budget must be at least $10'),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  templateId: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
});

// Proposal Schemas
export const submitProposalSchema = z.object({
  projectId: z.string(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  proposedPrice: z.number().min(1, 'Price must be greater than 0'),
  estimatedDays: z.number().min(1, 'Must take at least 1 day'),
  referenceLinks: z.array(z.string().url('Must be a valid URL')).max(5).optional(),
});

// Application Schemas (structured bidding)
export const submitApplicationSchema = z.object({
  projectId: z.string(),
  timeline: z.number().min(1, 'Timeline must be at least 1 day').max(365, 'Timeline too long'),
  proposalText: z.string().min(80, 'Proposal must be at least 80 characters').max(2000, 'Proposal is too long'),
  githubLinks: z.array(z.string().url('Must be a valid URL')).max(5, 'Maximum 5 GitHub links').default([]),
});

// ID Verification Schema (FR 1)
export const verifyIdSchema = z.object({
  nationalId: z.string().regex(/^\d{16}$/, 'National ID must be exactly 16 digits'),
  fullName: z.string().min(3, 'Full name is required'),
});

// Messaging Schema (FR 8)
export const sendMessageSchema = z.object({
  projectId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

// Dispute Schema (FR 10)
export const createDisputeSchema = z.object({
  projectId: z.string(),
  reason: z.string().min(20, 'Please provide a detailed reason (at least 20 characters)'),
});

// Mentor Review Schema (FR 9)
export const reviewProjectSchema = z.object({
  feedback: z.string().min(10, 'Please provide feedback (at least 10 characters)'),
});

// Dispute Resolution Schema
export const resolveDisputeSchema = z.object({
  resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
});

// Template management schemas
export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.nativeEnum(TemplateCategory),
  skillsRequired: z.array(z.string()).default([]),
  estimatedDays: z.number().min(1),
  basePrice: z.number().min(1),
  repositoryTemplate: z.string().url().optional().or(z.literal('')),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// Profile (bio, skills, GitHub — visible on portfolio / SME review)
export const updateProfileSchema = z
  .object({
    bio: z.string().max(2000).optional(),
    skills: z.array(z.string()).max(50).optional(),
    githubUsername: z.string().max(39).optional(),
    phone: z.string().max(32).optional(),
  })
  .strict();

