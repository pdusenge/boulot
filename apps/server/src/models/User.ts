import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole } from '@boulot/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: { type: String },
    skills: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    nationalId: { type: String },
    githubUsername: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
