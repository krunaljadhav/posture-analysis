import { Assessment } from '@/types/posture';

const STORAGE_KEY = 'physiocode_assessments';

export function saveAssessment(assessment: Assessment): void {
  const assessments = getAssessments();
  assessments.unshift(assessment);
  
  // Keep only last 50 assessments
  const trimmed = assessments.slice(0, 50);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getAssessments(): Assessment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      analysis: {
        ...a.analysis,
        timestamp: new Date(a.analysis.timestamp),
      },
    }));
  } catch {
    return [];
  }
}

export function getAssessmentById(id: string): Assessment | null {
  const assessments = getAssessments();
  return assessments.find(a => a.id === id) || null;
}

export function deleteAssessment(id: string): void {
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function generateAssessmentId(): string {
  return `PA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}
