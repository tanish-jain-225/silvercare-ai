export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  healthConditions?: string[];
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string;
  date: string;
  isActive: boolean;
  isRecurring?: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  language: string;
  setLanguage: (language: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}