// User types
export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// Authentication context types
export interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  loading: boolean;
}

// Question types
export interface Question {
  _id: string;
  subject: Subject | string;
  book: Book | string;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

// Subject types
export interface Subject {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Book types
export interface Book {
  _id: string;
  title: string;
  subject: Subject | string;
  author?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Result types
export interface Result {
  _id: string;
  user: string;
  subject?: Subject | string;
  book?: Book | string;
  testType: 'book' | 'admin' | 'ai';
  subjectName?: string;
  bookName?: string;
  chapterName?: string;
  score: number;
  total: number;
  timeSpent: number;
  difficulty: string;
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  question?: string;
  questionText?: string;
  selected: string;
  correct: boolean;
  explanation?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  cached?: boolean;
}

// Practice test types
export interface PracticeSettings {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  timeLimit: number | 'unlimited';
  showExplanations: boolean;
}

export interface TestType {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  features: string[];
  stats: Record<string, string>;
  onClick: () => void;
}

// UI Component types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface QuestionFormData {
  subject: string;
  book: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  explanation: string;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Statistics types
export interface UserStats {
  tests: number;
  avg: number;
  best: number;
  streakDays: number;
  bySubject: SubjectStats[];
  byTestType: TestTypeStats[];
  totalTime: number;
  improvement: number;
}

export interface SubjectStats {
  name: string;
  value: number;
  count: number;
}

export interface TestTypeStats {
  name: string;
  value: number;
  count: number;
}

// Admin types
export interface AdminStats {
  users: number;
  logs: number;
  results: number;
  questions: number;
}

export interface LogEntry {
  _id: string;
  method: string;
  url: string;
  status: number;
  ip: string;
  userId?: string;
  userAgent: string;
  responseMs: number;
  createdAt: string;
}

// AI types
export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIChatResponse {
  success: boolean;
  response: string;
  timestamp: string;
  note?: string;
}
