import { PostureAnalysis, MuscleImbalance, MuscleGroup, SeverityLevel } from '@/types/posture';

interface MusclePattern {
  name: string;
  condition: (analysis: PostureAnalysis) => boolean;
  severity: (analysis: PostureAnalysis) => SeverityLevel;
  relatedMetrics: string[];
}

const tightMusclePatterns: MusclePattern[] = [
  {
    name: 'Upper Trapezius',
    condition: (a) => a.headPosition.severity !== 'normal' && a.shoulderAlignment.severity !== 'normal',
    severity: (a) => a.headPosition.severity,
    relatedMetrics: ['Head Position', 'Shoulder Alignment'],
  },
  {
    name: 'Levator Scapulae',
    condition: (a) => a.headPosition.severity !== 'normal',
    severity: (a) => a.headPosition.severity,
    relatedMetrics: ['Head Position'],
  },
  {
    name: 'Suboccipitals',
    condition: (a) => a.headPosition.severity !== 'normal',
    severity: (a) => a.headPosition.severity,
    relatedMetrics: ['Head Position'],
  },
  {
    name: 'Pectoralis Major',
    condition: (a) => a.shoulderAlignment.angle > 5,
    severity: (a) => a.shoulderAlignment.severity,
    relatedMetrics: ['Shoulder Alignment'],
  },
  {
    name: 'Pectoralis Minor',
    condition: (a) => a.shoulderAlignment.angle > 5 || a.trunkTilt.angle > 5,
    severity: (a) => a.shoulderAlignment.severity,
    relatedMetrics: ['Shoulder Alignment', 'Trunk Tilt'],
  },
  {
    name: 'Hip Flexors (Iliopsoas)',
    condition: (a) => a.pelvicTilt.angle > 15,
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt'],
  },
  {
    name: 'Rectus Femoris',
    condition: (a) => a.pelvicTilt.angle > 15,
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt'],
  },
  {
    name: 'Erector Spinae (Lumbar)',
    condition: (a) => a.pelvicTilt.angle > 15 || a.trunkTilt.angle < -5,
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt', 'Trunk Tilt'],
  },
  {
    name: 'Hamstrings',
    condition: (a) => a.pelvicTilt.angle < 0 || a.kneeAlignment.angle < 170,
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt', 'Knee Alignment'],
  },
  {
    name: 'Gastrocnemius',
    condition: (a) => a.kneeAlignment.angle > 185,
    severity: (a) => a.kneeAlignment.severity,
    relatedMetrics: ['Knee Alignment'],
  },
];

const weakMusclePatterns: MusclePattern[] = [
  {
    name: 'Deep Neck Flexors',
    condition: (a) => a.headPosition.severity !== 'normal',
    severity: (a) => a.headPosition.severity,
    relatedMetrics: ['Head Position'],
  },
  {
    name: 'Lower Trapezius',
    condition: (a) => a.shoulderAlignment.angle > 5,
    severity: (a) => a.shoulderAlignment.severity,
    relatedMetrics: ['Shoulder Alignment'],
  },
  {
    name: 'Rhomboids',
    condition: (a) => a.shoulderAlignment.angle > 5,
    severity: (a) => a.shoulderAlignment.severity,
    relatedMetrics: ['Shoulder Alignment'],
  },
  {
    name: 'Serratus Anterior',
    condition: (a) => a.shoulderAlignment.severity !== 'normal',
    severity: (a) => a.shoulderAlignment.severity,
    relatedMetrics: ['Shoulder Alignment'],
  },
  {
    name: 'Core Abdominals',
    condition: (a) => a.pelvicTilt.angle > 15 || a.trunkTilt.severity !== 'normal',
    severity: (a) => a.trunkTilt.severity,
    relatedMetrics: ['Pelvic Tilt', 'Trunk Tilt'],
  },
  {
    name: 'Gluteus Maximus',
    condition: (a) => a.pelvicTilt.angle > 15,
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt'],
  },
  {
    name: 'Gluteus Medius',
    condition: (a) => a.pelvicTilt.severity !== 'normal',
    severity: (a) => a.pelvicTilt.severity,
    relatedMetrics: ['Pelvic Tilt'],
  },
  {
    name: 'Quadriceps (VMO)',
    condition: (a) => a.kneeAlignment.angle > 185,
    severity: (a) => a.kneeAlignment.severity,
    relatedMetrics: ['Knee Alignment'],
  },
  {
    name: 'Tibialis Anterior',
    condition: (a) => a.kneeAlignment.severity !== 'normal',
    severity: (a) => a.kneeAlignment.severity,
    relatedMetrics: ['Knee Alignment'],
  },
];

export function analyzeMuscleImbalance(analysis: PostureAnalysis): MuscleImbalance {
  const tightMuscles: MuscleGroup[] = tightMusclePatterns
    .filter((pattern) => pattern.condition(analysis))
    .map((pattern) => ({
      name: pattern.name,
      status: 'tight' as const,
      severity: pattern.severity(analysis),
      relatedMetrics: pattern.relatedMetrics,
    }));

  const weakMuscles: MuscleGroup[] = weakMusclePatterns
    .filter((pattern) => pattern.condition(analysis))
    .map((pattern) => ({
      name: pattern.name,
      status: 'weak' as const,
      severity: pattern.severity(analysis),
      relatedMetrics: pattern.relatedMetrics,
    }));

  // Calculate overall balance score
  const severityScores: Record<SeverityLevel, number> = {
    normal: 0,
    mild: 1,
    medium: 2,
    severe: 3,
  };

  const totalImbalances = [...tightMuscles, ...weakMuscles];
  const maxPossibleScore = totalImbalances.length * 3;
  const actualScore = totalImbalances.reduce(
    (sum, muscle) => sum + severityScores[muscle.severity],
    0
  );

  const overallBalance = maxPossibleScore > 0
    ? Math.round(100 - (actualScore / maxPossibleScore) * 100)
    : 100;

  return {
    tightMuscles,
    weakMuscles,
    overallBalance,
  };
}
