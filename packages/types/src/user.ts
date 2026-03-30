import { UserRole } from './enums';

export interface IUser {
  _id: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  bio?: string;
  skills?: string[];
  isVerified: boolean;
  nationalId?: string;
  githubUsername?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
