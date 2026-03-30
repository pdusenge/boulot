import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '@boulot/types';

export interface IMessageDocument extends Omit<IMessage, '_id'>, Document {}

const MessageSchema = new Schema<IMessageDocument>(
  {
    projectId: { type: String, required: true, ref: 'Project' },
    senderId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);
