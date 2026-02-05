export interface Landmark {
  x: number;
  y: number;
  score?: number;
  name: string;
}

export interface PostureLandmarks {
  ear: Landmark | null;
  shoulder: Landmark | null;
  hip: Landmark | null;
  knee: Landmark | null;
  ankle: Landmark | null;
  asis?: Landmark | null;
  psis?: Landmark | null;
}

export type SeverityLevel = 'normal' | 'mild' | 'medium' | 'severe';

export interface PostureMetric {
  name: string;
  angle: number;
  normalRange: [number, number];
  severity: SeverityLevel;
  description: string;
  recommendation: string;
}

// Extended metrics
export interface ExtendedMetrics {
  ankleAlignment: PostureMetric;
  cervicalLordosis: PostureMetric;
  thoracicKyphosis: PostureMetric;
  lumbarLordosis: PostureMetric;
}

// Muscle imbalance detection
export interface MuscleGroup {
  name: string;
  status: 'tight' | 'weak' | 'normal';
  severity: SeverityLevel;
  relatedMetrics: string[];
}

export interface MuscleImbalance {
  tightMuscles: MuscleGroup[];
  weakMuscles: MuscleGroup[];
  overallBalance: number; // 0-100 score
}

// Exercise recommendations
export interface Exercise {
  id: string;
  name: string;
  category: 'stretch' | 'strengthen' | 'mobility';
  targetMuscles: string[];
  duration: string;
  reps: string;
  description: string;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export interface ExerciseRecommendation {
  priority: 'high' | 'medium' | 'low';
  exercise: Exercise;
  reason: string;
}

export interface PostureAnalysis {
  headPosition: PostureMetric;
  shoulderAlignment: PostureMetric;
  pelvicTilt: PostureMetric;
  trunkTilt: PostureMetric;
  kneeAlignment: PostureMetric;
  extendedMetrics?: ExtendedMetrics;
  muscleImbalance?: MuscleImbalance;
  exerciseRecommendations?: ExerciseRecommendation[];
  overallScore: number;
  timestamp: Date;
}

export interface Assessment {
  id: string;
  imageData: string;
  landmarks: PostureLandmarks;
  analysis: PostureAnalysis;
  createdAt: Date;
}

// Progress tracking
export interface ProgressData {
  date: Date;
  overallScore: number;
  headPosition: number;
  shoulderAlignment: number;
  pelvicTilt: number;
  trunkTilt: number;
  kneeAlignment: number;
}
