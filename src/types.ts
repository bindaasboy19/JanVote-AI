export type UserType = 'first_time' | 'regular' | 'volunteer' | 'low_literacy';

export interface UserProfile {
  userId: string;
  userType: UserType;
  language: 'en' | 'hi';
  createdAt: string;
}

export interface Script {
  id: string;
  authorId: string;
  prompt: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
