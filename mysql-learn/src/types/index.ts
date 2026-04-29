export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';
export type LevelStatus = 'locked' | 'available' | 'completed';

export interface UserData {
  name: string;
  joinDate: string;
  lastActive: string;
  streak: number;
  totalStudyMinutes: number;
}

export interface ModuleProgress {
  status: ModuleStatus;
  topicsRead: string[];
  examScore: number | null;
  examAttempts: number;
  lastAccessed: string | null;
  completedAt: string | null;
}

export interface DailyActivity {
  modulesStudied: number;
  minutesSpent: number;
}

export interface ProgressData {
  user: UserData;
  progress: Record<string, ModuleProgress>;
  achievements: string[];
  dailyActivity: Record<string, DailyActivity>;
}

export interface LevelInfo {
  id: number;
  name: string;
  description: string;
  modules: number[];
  color: string;
}

export interface TopicContent {
  id: string;
  title: string;
  content: string;
  codeExamples: CodeExample[];
  commonMistakes?: string[];
  tips?: string[];
}

export interface CodeExample {
  title: string;
  code: string;
  output?: string;
  description?: string;
}

export interface ModuleData {
  id: number;
  title: string;
  level: number;
  description: string;
  estimatedMinutes: number;
  topics: TopicContent[];
  summary: string[];
  funFact?: string;
  database: DatabaseType;
}

export type DatabaseType = 'toko' | 'perusahaan' | 'ecommerce' | 'blog' | 'analitik';

export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'drag_drop'
  | 'identify_error'
  | 'predict_output'
  | 'write_query';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  question: string;
  context?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  blanks?: string[];
  orderItems?: string[];
  expectedOutput?: string;
  database?: DatabaseType;
}

export interface ExamData {
  moduleId: number;
  questions: ExamQuestion[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  rowsAffected?: number;
  error?: string;
  wasLimitAdded?: boolean;
  resultType?: 'rows' | 'dml_success' | 'error' | 'timeout' | 'blocked' | 'empty';
}
