export interface IMessage {
  _id: string;
  projectId: string; // Ref to Project
  senderId: string; // Ref to User
  receiverId: string; // Ref to User
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
