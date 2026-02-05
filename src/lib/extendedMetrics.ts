import { PostureLandmarks, ExtendedMetrics, PostureMetric, SeverityLevel } from '@/types/posture';

function getSeverity(
  angle: number,
  normalRange: [number, number],
  thresholds: { mild: number; medium: number; severe: number }
): SeverityLevel {
  const mid = (normalRange[0] + normalRange[1]) / 2;
  const deviation = Math.abs(angle - mid);

  if (deviation <= thresholds.mild) return 'normal';
  if (deviation <= thresholds.medium) return 'mild';
  if (deviation <= thresholds.severe) return 'medium';
  return 'severe';
}

function analyzeAnkleAlignment(landmarks: PostureLandmarks): PostureMetric {
  const { knee, ankle } = landmarks;

  if (!knee || !ankle) {
    return {
      name: 'Ankle Alignment',
      angle: 0,
      normalRange: [85, 95],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure knee and ankle are visible',
    };
  }

  // Calculate ankle angle relative to vertical
  const dx = knee.x - ankle.x;
  const dy = knee.y - ankle.y;
  const angle = 90 - Math.atan2(dx, dy) * (180 / Math.PI);

  const severity = getSeverity(angle, [85, 95], { mild: 5, medium: 10, severe: 15 });

  let description = 'Normal ankle alignment';
  let recommendation = 'Maintain current stance';

  if (Math.abs(angle - 90) > 5) {
    if (angle > 95) {
      description = 'Ankle dorsiflexion detected';
      recommendation = 'Check for tight calf muscles, consider calf stretches';
    } else if (angle < 85) {
      description = 'Ankle plantarflexion detected';
      recommendation = 'Strengthen tibialis anterior, stretch Achilles tendon';
    }
  }

  return {
    name: 'Ankle Alignment',
    angle: Math.round(angle * 10) / 10,
    normalRange: [85, 95],
    severity,
    description,
    recommendation,
  };
}

function analyzeCervicalLordosis(landmarks: PostureLandmarks): PostureMetric {
  const { ear, shoulder } = landmarks;

  if (!ear || !shoulder) {
    return {
      name: 'Cervical Lordosis',
      angle: 0,
      normalRange: [30, 40],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure ear and shoulder are visible',
    };
  }

  // Estimate cervical curve (simplified using ear-shoulder relationship)
  const dx = ear.x - shoulder.x;
  const dy = shoulder.y - ear.y;
  const angle = Math.atan2(Math.abs(dx), dy) * (180 / Math.PI);

  // Map to expected cervical lordosis range (normally 20-40 degrees)
  const estimatedLordosis = 35 + (dx > 0 ? -angle : angle);

  const severity = getSeverity(estimatedLordosis, [30, 40], { mild: 5, medium: 10, severe: 15 });

  let description = 'Normal cervical lordosis';
  let recommendation = 'Maintain current neck posture';

  if (estimatedLordosis < 25) {
    description = 'Reduced cervical lordosis (flat neck)';
    recommendation = 'Practice gentle neck extension exercises';
  } else if (estimatedLordosis > 45) {
    description = 'Increased cervical lordosis';
    recommendation = 'Strengthen deep neck flexors, practice chin tucks';
  }

  return {
    name: 'Cervical Lordosis',
    angle: Math.round(estimatedLordosis * 10) / 10,
    normalRange: [30, 40],
    severity,
    description,
    recommendation,
  };
}

function analyzeThoracicKyphosis(landmarks: PostureLandmarks): PostureMetric {
  const { shoulder, hip } = landmarks;

  if (!shoulder || !hip) {
    return {
      name: 'Thoracic Kyphosis',
      angle: 0,
      normalRange: [20, 40],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure shoulder and hip are visible',
    };
  }

  // Estimate thoracic curve from shoulder-hip relationship
  const dx = shoulder.x - hip.x;
  const dy = hip.y - shoulder.y;
  const forwardLean = Math.atan2(dx, dy) * (180 / Math.PI);

  // Map to expected kyphosis range
  const estimatedKyphosis = 30 + forwardLean * 2;

  const severity = getSeverity(estimatedKyphosis, [20, 40], { mild: 10, medium: 15, severe: 20 });

  let description = 'Normal thoracic kyphosis';
  let recommendation = 'Maintain current upper back posture';

  if (estimatedKyphosis > 45) {
    description = 'Increased thoracic kyphosis (rounded upper back)';
    recommendation = 'Strengthen thoracic extensors, practice wall angels';
  } else if (estimatedKyphosis < 15) {
    description = 'Reduced thoracic kyphosis (flat upper back)';
    recommendation = 'Gentle mobility exercises, avoid excessive extension';
  }

  return {
    name: 'Thoracic Kyphosis',
    angle: Math.round(estimatedKyphosis * 10) / 10,
    normalRange: [20, 40],
    severity,
    description,
    recommendation,
  };
}

function analyzeLumbarLordosis(landmarks: PostureLandmarks): PostureMetric {
  const { hip, shoulder, knee } = landmarks;

  if (!hip || !shoulder || !knee) {
    return {
      name: 'Lumbar Lordosis',
      angle: 0,
      normalRange: [40, 60],
      severity: 'normal',
      description: 'Unable to detect - landmarks not visible',
      recommendation: 'Please ensure hip, shoulder, and knee are visible',
    };
  }

  // Lumbar lordosis correlates with pelvic tilt and trunk position
  // We estimate it using the relationship between trunk angle and hip position
  
  // Calculate trunk angle (shoulder to hip line relative to vertical)
  const trunkDx = hip.x - shoulder.x;
  const trunkDy = hip.y - shoulder.y;
  const trunkAngle = Math.atan2(trunkDx, trunkDy) * (180 / Math.PI);
  
  // Calculate lower body angle (hip to knee relative to vertical)
  const lowerDx = knee.x - hip.x;
  const lowerDy = knee.y - hip.y;
  const lowerAngle = Math.atan2(lowerDx, lowerDy) * (180 / Math.PI);
  
  // Lumbar lordosis is estimated from the angular relationship
  // Greater difference between trunk and lower angles suggests more lordosis
  const lordosisEstimate = 50 + (lowerAngle - trunkAngle);

  const severity = getSeverity(lordosisEstimate, [40, 60], { mild: 10, medium: 15, severe: 20 });

  let description = 'Normal lumbar lordosis';
  let recommendation = 'Maintain current lower back posture';

  if (lordosisEstimate > 65) {
    description = 'Increased lumbar lordosis (excessive arch)';
    recommendation = 'Strengthen core, stretch hip flexors';
  } else if (lordosisEstimate < 35) {
    description = 'Reduced lumbar lordosis (flat lower back)';
    recommendation = 'Stretch hamstrings, mobility exercises';
  }

  return {
    name: 'Lumbar Lordosis',
    angle: Math.round(lordosisEstimate * 10) / 10,
    normalRange: [40, 60],
    severity,
    description,
    recommendation,
  };
}

export function analyzeExtendedMetrics(landmarks: PostureLandmarks): ExtendedMetrics {
  return {
    ankleAlignment: analyzeAnkleAlignment(landmarks),
    cervicalLordosis: analyzeCervicalLordosis(landmarks),
    thoracicKyphosis: analyzeThoracicKyphosis(landmarks),
    lumbarLordosis: analyzeLumbarLordosis(landmarks),
  };
}
