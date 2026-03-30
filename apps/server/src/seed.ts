import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import { UserModel } from './models/User';
import { UserRole, ProjectStatus } from '@boulot/types';
import { ProjectModel } from './models/Project';

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing database...');
    await UserModel.deleteMany({});
    await ProjectModel.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Creating demo users...');
    const student = await UserModel.create({
      email: 'student@example.com',
      passwordHash,
      role: UserRole.STUDENT,
      firstName: 'Alice',
      lastName: 'Student',
      skills: ['React', 'Node.js', 'TypeScript'],
      isVerified: true,
    });

    const sme = await UserModel.create({
      email: 'sme@example.com',
      passwordHash,
      role: UserRole.SME,
      firstName: 'Bob',
      lastName: 'Enterprise',
      isVerified: true,
    });

    const mentor = await UserModel.create({
      email: 'mentor@example.com',
      passwordHash,
      role: UserRole.MENTOR,
      firstName: 'Charlie',
      lastName: 'Expert',
      skills: ['System Design', 'Code Review'],
      isVerified: true,
    });

    const admin = await UserModel.create({
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
    });

    console.log('Creating demo projects...');
    await ProjectModel.create([
      {
        smeId: sme._id,
        title: 'E-commerce Frontend Rewrite',
        description: 'Need a complete rewrite of our legacy frontend using Next.js and Tailwind.',
        budget: 500,
        skillsRequired: ['Next.js', 'React', 'Tailwind'],
        status: ProjectStatus.OPEN,
      },
      {
        smeId: sme._id,
        title: 'Inventory Management API',
        description: 'Need a stable Express/Node API to manage our warehouse inventory.',
        budget: 450,
        skillsRequired: ['Node.js', 'Express', 'MongoDB'],
        status: ProjectStatus.OPEN,
      },
    ]);

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
