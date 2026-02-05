import { PostureLandmarks, PostureAnalysis, PostureMetric, SeverityLevel } from '@/types/posture';
import { analyzeExtendedMetrics } from './extendedMetrics';
import { analyzeMuscleImbalance } from './muscleImbalance';
import { getExerciseRecommendations } from './exerciseRecommendations';

function calculateAngle(p1: { x: number; y: number }, p2: { x: number; y: number }, p3?: { x: number; y: number }): number {
  if (p3) {
    // Angle at p2 between p1-p2-p3
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs((angle1 - angle2) * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  } else {
    // Angle from vertical (p1 above p2)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dx, dy) * 180 / Math.PI;
    return angle;
  }
}

function getSeverity(angle: number, normalRange: [number, number], thresholds: { mild: number; medium: number; severe: number }): SeverityLevel {
  const deviation = Math.abs(angle - (normalRange[0] + normalRange[1]) / 2);
  
  if (deviation <= thresholds.mild) return 'normal';
  if (deviation <= thresholds.medium) return 'mild';
  if (deviation <= thresholds.severe) return 'medium';
  return 'severe';
}

function analyzeHeadPosition(landmarks: PostureLandmarks): PostureMetric {
  const { ear, shoulder } = landmarks;
  
  if (!ear || !shoulder) {
    return {
      name: 'Head Position (Craniovertebral Angle)',
      angle: 0,
      normalRange: [0, 5],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure ear and shoulder are visible in the image',
    };
  }
  
  // Calculate forward head angle from vertical
  const angle = calculateAngle(ear, shoulder);
  const absAngle = Math.abs(angle);
  
  const severity = getSeverity(absAngle, [0, 5], { mild: 5, medium: 10, severe: 15 });
  
  let description = 'Normal head position';
  let recommendation = 'Maintain current posture';
  
  if (severity === 'mild') {
    description = 'Slight forward head posture detected';
    recommendation = 'Practice chin tucks and neck stretches';
  } else if (severity === 'medium') {
    description = 'Moderate forward head posture';
    recommendation = 'Strengthen neck extensors, regular breaks from screens';
  } else if (severity === 'severe') {
    description = 'Significant forward head posture';
    recommendation = 'Consult a physiotherapist for corrective exercises';
  }
  
  return {
    name: 'Head Position (Craniovertebral Angle)',
    angle: Math.round(absAngle * 10) / 10,
    normalRange: [0, 5],
    severity,
    description,
    recommendation,
  };
}

function analyzeShoulderAlignment(landmarks: PostureLandmarks): PostureMetric {
  const { shoulder, hip, ankle } = landmarks;
  
  if (!shoulder || !ankle) {
    return {
      name: 'Shoulder Alignment',
      angle: 0,
      normalRange: [-5, 5],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure shoulder and ankle are visible',
    };
  }
  
  // Calculate shoulder position relative to plumb line from ankle
  const plumbX = ankle.x;
  const deviation = shoulder.x - plumbX;
  const deviationAngle = Math.atan2(deviation, shoulder.y - ankle.y) * 180 / Math.PI;
  
  const severity = getSeverity(Math.abs(deviationAngle), [0, 5], { mild: 5, medium: 10, severe: 15 });
  
  let description = 'Normal shoulder alignment';
  let recommendation = 'Maintain current posture';
  
  if (deviation > 10) {
    description = `Protracted shoulders (${severity})`;
    recommendation = 'Strengthen rhomboids and middle trapezius';
  } else if (deviation < -10) {
    description = `Retracted shoulders (${severity})`;
    recommendation = 'Stretch pectorals, maintain neutral position';
  }
  
  return {
    name: 'Shoulder Alignment',
    angle: Math.round(deviationAngle * 10) / 10,
    normalRange: [-5, 5],
    severity,
    description,
    recommendation,
  };
}

function analyzePelvicTilt(landmarks: PostureLandmarks): PostureMetric {
  const { hip, shoulder, knee } = landmarks;
  
  if (!hip || !shoulder || !knee) {
    return {
      name: 'Pelvic Tilt',
      angle: 0,
      normalRange: [5, 15],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure hip, shoulder, and knee are visible',
    };
  }
  
  // For lateral posture analysis, pelvic tilt is estimated using:
  // 1. The angle of the line from hip to shoulder relative to vertical (trunk lean)
  // 2. The position of the hip relative to the knee and shoulder
  
  // Calculate the horizontal displacement of hip relative to a vertical line from shoulder
  const shoulderToHipHorizontal = hip.x - shoulder.x;
  const shoulderToHipVertical = hip.y - shoulder.y;
  
  // Calculate the horizontal displacement of hip relative to knee
  const hipToKneeHorizontal = knee.x - hip.x;
  const hipToKneeVertical = knee.y - hip.y;
  
  // Trunk angle from vertical (positive = forward lean)
  const trunkAngle = Math.atan2(shoulderToHipHorizontal, shoulderToHipVertical) * (180 / Math.PI);
  
  // Thigh angle from vertical (positive = hip behind knee)
  const thighAngle = Math.atan2(hipToKneeHorizontal, hipToKneeVertical) * (180 / Math.PI);
  
  // Pelvic tilt estimation based on the difference between trunk and thigh angles
  // Anterior tilt: hip is pushed forward relative to upper body, creating lordosis
  // Posterior tilt: hip is tucked under, flattening the lower back
  
  // A positive value indicates anterior tilt (more common)
  // The relationship: if trunk leans back and thigh angles forward, indicates anterior tilt
  const pelvicTiltEstimate = (thighAngle - trunkAngle) + 10; // +10 baseline for neutral standing
  
  // Normal anterior pelvic tilt is 7-15 degrees
  // Values above 15 = excessive anterior tilt
  // Values below 5 = posterior tilt or flat back
  
  let severity: SeverityLevel = 'normal';
  let description = 'Normal pelvic alignment';
  let recommendation = 'Maintain current alignment';
  let tiltType = 'Neutral';
  
  const angle = Math.round(pelvicTiltEstimate * 10) / 10;
  
  if (angle > 20) {
    severity = 'severe';
    tiltType = 'Anterior';
    description = 'Excessive Anterior Pelvic Tilt - pelvis tilted significantly forward, causing increased lumbar lordosis (swayback)';
    recommendation = 'Strengthen glutes and core, stretch hip flexors (iliopsoas, rectus femoris) daily. Consider physiotherapy consultation.';
  } else if (angle > 15) {
    severity = 'medium';
    tiltType = 'Anterior';
    description = 'Moderate Anterior Pelvic Tilt - pelvis tilted forward, may cause lower back strain';
    recommendation = 'Focus on hip flexor stretches and glute/core strengthening exercises';
  } else if (angle > 12) {
    severity = 'mild';
    tiltType = 'Anterior';
    description = 'Mild Anterior Pelvic Tilt - slight forward tilt of pelvis';
    recommendation = 'Incorporate hip flexor stretches and core stabilization exercises';
  } else if (angle >= 7) {
    severity = 'normal';
    tiltType = 'Neutral';
    description = 'Normal Pelvic Position - healthy neutral alignment';
    recommendation = 'Maintain current posture with regular stretching and strengthening';
  } else if (angle >= 5) {
    severity = 'mild';
    tiltType = 'Posterior';
    description = 'Mild Posterior Pelvic Tilt - slight backward tilt, may flatten lower back';
    recommendation = 'Stretch hamstrings, strengthen hip flexors gently';
  } else if (angle >= 0) {
    severity = 'medium';
    tiltType = 'Posterior';
    description = 'Moderate Posterior Pelvic Tilt - pelvis tucked under, flattening lumbar curve';
    recommendation = 'Stretch hamstrings and glutes, strengthen hip flexors and lower back extensors';
  } else {
    severity = 'severe';
    tiltType = 'Posterior';
    description = 'Excessive Posterior Pelvic Tilt - significant backward tilt causing flat back posture';
    recommendation = 'Consult a physiotherapist. Focus on hip flexor strengthening and hamstring flexibility.';
  }
  
  return {
    name: `Pelvic Tilt (${tiltType})`,
    angle: angle,
    normalRange: [7, 11],
    severity,
    description,
    recommendation,
  };
}

function analyzeTrunkTilt(landmarks: PostureLandmarks): PostureMetric {
  const { shoulder, hip } = landmarks;
  
  if (!shoulder || !hip) {
    return {
      name: 'Trunk Tilt',
      angle: 0,
      normalRange: [-3, 3],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure shoulder and hip are visible',
    };
  }
  
  const angle = calculateAngle(shoulder, hip);
  
  const severity = getSeverity(Math.abs(angle), [0, 3], { mild: 5, medium: 8, severe: 12 });
  
  let description = 'Normal trunk alignment';
  let recommendation = 'Maintain current posture';
  
  if (angle > 5) {
    description = 'Forward trunk tilt detected';
    recommendation = 'Strengthen back extensors, improve core stability';
  } else if (angle < -5) {
    description = 'Backward trunk tilt detected';
    recommendation = 'Strengthen abdominals, check for swayback posture';
  }
  
  return {
    name: 'Trunk Tilt',
    angle: Math.round(angle * 10) / 10,
    normalRange: [-3, 3],
    severity,
    description,
    recommendation,
  };
}

function analyzeKneeAlignment(landmarks: PostureLandmarks): PostureMetric {
  const { hip, knee, ankle } = landmarks;
  
  if (!hip || !knee || !ankle) {
    return {
      name: 'Knee Alignment (Hip-Knee-Ankle)',
      angle: 180,
      normalRange: [175, 180],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure hip, knee, and ankle are visible',
    };
  }
  
  const angle = calculateAngle(hip, knee, ankle);
  
  let severity: SeverityLevel = 'normal';
  let description = 'Normal knee alignment';
  let recommendation = 'Maintain current stance';
  
  if (angle > 185) {
    severity = angle > 190 ? 'medium' : 'mild';
    description = 'Knee hyperextension detected';
    recommendation = 'Strengthen quadriceps, avoid locking knees';
  } else if (angle < 170) {
    severity = angle < 165 ? 'medium' : 'mild';
    description = 'Knee flexion detected';
    recommendation = 'Check for hamstring tightness, strengthen quads';
  }
  
  return {
    name: 'Knee Alignment (Hip-Knee-Ankle)',
    angle: Math.round(angle * 10) / 10,
    normalRange: [175, 180],
    severity,
    description,
    recommendation,
  };
}

function calculateOverallScore(metrics: PostureMetric[]): number {
  const severityScores: Record<SeverityLevel, number> = {
    normal: 100,
    mild: 75,
    medium: 50,
    severe: 25,
  };
  
  const validMetrics = metrics.filter(m => m.description !== 'Unable to detect - landmarks not visible');
  
  if (validMetrics.length === 0) return 0;
  
  const total = validMetrics.reduce((sum, metric) => sum + severityScores[metric.severity], 0);
  return Math.round(total / validMetrics.length);
}

export function analyzePosture(landmarks: PostureLandmarks): PostureAnalysis {
  const headPosition = analyzeHeadPosition(landmarks);
  const shoulderAlignment = analyzeShoulderAlignment(landmarks);
  const pelvicTilt = analyzePelvicTilt(landmarks);
  const trunkTilt = analyzeTrunkTilt(landmarks);
  const kneeAlignment = analyzeKneeAlignment(landmarks);
  
  const overallScore = calculateOverallScore([
    headPosition,
    shoulderAlignment,
    pelvicTilt,
    trunkTilt,
    kneeAlignment,
  ]);

  // Extended analysis
  const extendedMetrics = analyzeExtendedMetrics(landmarks);
  
  const baseAnalysis: PostureAnalysis = {
    headPosition,
    shoulderAlignment,
    pelvicTilt,
    trunkTilt,
    kneeAlignment,
    extendedMetrics,
    overallScore,
    timestamp: new Date(),
  };

  // Add muscle imbalance analysis
  const muscleImbalance = analyzeMuscleImbalance(baseAnalysis);
  
  // Add exercise recommendations
  const exerciseRecommendations = getExerciseRecommendations(baseAnalysis);

  return {
    ...baseAnalysis,
    muscleImbalance,
    exerciseRecommendations,
  };
}
