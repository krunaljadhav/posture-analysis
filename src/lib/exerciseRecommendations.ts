import { PostureAnalysis, Exercise, ExerciseRecommendation, SeverityLevel } from '@/types/posture';

const exerciseDatabase: Exercise[] = [
  // Stretches
  {
    id: 'chin-tuck',
    name: 'Chin Tucks',
    category: 'stretch',
    targetMuscles: ['Suboccipitals', 'Upper Trapezius'],
    duration: '30 seconds',
    reps: '10 reps, 3 sets',
    description: 'Retract your chin straight back to correct forward head posture.',
    instructions: [
      'Sit or stand with good posture',
      'Keep your eyes looking forward',
      'Gently draw your chin straight back (like making a double chin)',
      'Hold for 5 seconds, then relax',
      'Keep your head level - don\'t tilt up or down',
    ],
    difficulty: 'beginner',
    icon: '🎯',
  },
  {
    id: 'neck-stretch',
    name: 'Levator Scapulae Stretch',
    category: 'stretch',
    targetMuscles: ['Levator Scapulae', 'Upper Trapezius'],
    duration: '30 seconds each side',
    reps: '3 times each side',
    description: 'Stretch the muscles connecting your neck to shoulder blade.',
    instructions: [
      'Sit with good posture, hold the seat with your right hand',
      'Turn your head 45 degrees to the left',
      'Gently tilt your head down, looking toward your left armpit',
      'Use your left hand to gently increase the stretch',
      'Hold 30 seconds, then switch sides',
    ],
    difficulty: 'beginner',
    icon: '🔄',
  },
  {
    id: 'doorway-stretch',
    name: 'Doorway Pec Stretch',
    category: 'stretch',
    targetMuscles: ['Pectoralis Major', 'Pectoralis Minor'],
    duration: '30 seconds',
    reps: '3 times',
    description: 'Open up the chest to counteract rounded shoulders.',
    instructions: [
      'Stand in a doorway with arms at 90 degrees',
      'Place forearms on the door frame',
      'Step one foot forward through the doorway',
      'Lean forward until you feel a stretch in your chest',
      'Keep your core engaged and don\'t arch your lower back',
    ],
    difficulty: 'beginner',
    icon: '🚪',
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Kneeling Hip Flexor Stretch',
    category: 'stretch',
    targetMuscles: ['Hip Flexors (Iliopsoas)', 'Rectus Femoris'],
    duration: '30 seconds each side',
    reps: '3 times each side',
    description: 'Stretch tight hip flexors that contribute to anterior pelvic tilt.',
    instructions: [
      'Kneel on your right knee with left foot in front',
      'Keep your torso upright and engage your core',
      'Tuck your pelvis under (posterior tilt)',
      'Shift your weight forward until you feel a stretch',
      'Raise your right arm overhead for a deeper stretch',
    ],
    difficulty: 'beginner',
    icon: '🧘',
  },
  {
    id: 'hamstring-stretch',
    name: 'Supine Hamstring Stretch',
    category: 'stretch',
    targetMuscles: ['Hamstrings'],
    duration: '30 seconds each leg',
    reps: '3 times each leg',
    description: 'Stretch hamstrings to improve pelvic alignment.',
    instructions: [
      'Lie on your back with both legs extended',
      'Lift one leg up toward the ceiling',
      'Keep your knee straight or slightly bent',
      'Use a strap or towel around your foot if needed',
      'Keep your lower back pressed into the floor',
    ],
    difficulty: 'beginner',
    icon: '🦵',
  },
  // Strengthening exercises
  {
    id: 'deep-neck-flexor',
    name: 'Deep Neck Flexor Activation',
    category: 'strengthen',
    targetMuscles: ['Deep Neck Flexors'],
    duration: '10 seconds hold',
    reps: '10 reps, 3 sets',
    description: 'Strengthen the deep neck muscles that support proper head position.',
    instructions: [
      'Lie on your back with knees bent',
      'Gently nod your head as if saying "yes"',
      'Imagine lengthening the back of your neck',
      'Hold for 10 seconds while breathing normally',
      'Progress to lifting your head slightly off the floor',
    ],
    difficulty: 'beginner',
    icon: '💪',
  },
  {
    id: 'wall-angels',
    name: 'Wall Angels',
    category: 'strengthen',
    targetMuscles: ['Lower Trapezius', 'Rhomboids', 'Serratus Anterior'],
    duration: '5 seconds per rep',
    reps: '10 reps, 3 sets',
    description: 'Strengthen upper back muscles to improve shoulder posture.',
    instructions: [
      'Stand with back against wall, feet 6 inches from wall',
      'Press lower back, upper back, and head into the wall',
      'Place arms at 90 degrees like goalposts against wall',
      'Slowly slide arms up while keeping contact with wall',
      'Return to starting position',
    ],
    difficulty: 'intermediate',
    icon: '👼',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'strengthen',
    targetMuscles: ['Core Abdominals', 'Transverse Abdominis'],
    duration: '3 seconds per rep',
    reps: '10 reps each side, 3 sets',
    description: 'Core strengthening exercise that promotes neutral spine.',
    instructions: [
      'Lie on back with arms extended toward ceiling',
      'Lift legs with hips and knees at 90 degrees',
      'Press lower back into the floor',
      'Slowly lower opposite arm and leg toward floor',
      'Return and repeat on other side',
    ],
    difficulty: 'intermediate',
    icon: '🐛',
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'strengthen',
    targetMuscles: ['Gluteus Maximus', 'Gluteus Medius', 'Core Abdominals'],
    duration: '5 seconds hold',
    reps: '15 reps, 3 sets',
    description: 'Strengthen glutes to improve pelvic stability.',
    instructions: [
      'Lie on back with knees bent, feet flat on floor',
      'Engage your core and squeeze your glutes',
      'Lift hips until body forms straight line from knees to shoulders',
      'Hold at the top for 5 seconds',
      'Lower slowly and repeat',
    ],
    difficulty: 'beginner',
    icon: '🌉',
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'strengthen',
    targetMuscles: ['Core Abdominals', 'Erector Spinae', 'Gluteus Maximus'],
    duration: '5 seconds hold',
    reps: '10 reps each side, 3 sets',
    description: 'Improve core stability and spinal alignment.',
    instructions: [
      'Start on hands and knees in tabletop position',
      'Keep spine neutral and core engaged',
      'Extend right arm forward and left leg back',
      'Hold for 5 seconds without rotating hips',
      'Return to start and switch sides',
    ],
    difficulty: 'intermediate',
    icon: '🐕',
  },
  // Mobility exercises
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    category: 'mobility',
    targetMuscles: ['Erector Spinae', 'Core Abdominals'],
    duration: '5 seconds each position',
    reps: '10 cycles',
    description: 'Improve spinal mobility and body awareness.',
    instructions: [
      'Start on hands and knees in tabletop position',
      'Cow: Drop belly, lift chest and tailbone, look up',
      'Cat: Round spine toward ceiling, tuck chin',
      'Move slowly between positions',
      'Breathe in for cow, breathe out for cat',
    ],
    difficulty: 'beginner',
    icon: '🐱',
  },
  {
    id: 'thoracic-rotation',
    name: 'Thoracic Spine Rotation',
    category: 'mobility',
    targetMuscles: ['Thoracic Spine', 'Obliques'],
    duration: '30 seconds each side',
    reps: '10 reps each side',
    description: 'Improve upper back mobility and reduce stiffness.',
    instructions: [
      'Start on hands and knees or in child\'s pose',
      'Place one hand behind your head',
      'Rotate your upper back, bringing elbow toward ceiling',
      'Follow your elbow with your eyes',
      'Return and repeat, then switch sides',
    ],
    difficulty: 'beginner',
    icon: '🔃',
  },
  {
    id: 'ankle-circles',
    name: 'Ankle Mobility Circles',
    category: 'mobility',
    targetMuscles: ['Gastrocnemius', 'Tibialis Anterior'],
    duration: '30 seconds each direction',
    reps: '10 circles each way, each foot',
    description: 'Improve ankle mobility for better standing posture.',
    instructions: [
      'Sit or stand on one leg (hold support if needed)',
      'Lift one foot off the ground',
      'Draw large circles with your toes',
      'Move slowly through full range of motion',
      'Switch directions, then switch feet',
    ],
    difficulty: 'beginner',
    icon: '⭕',
  },
];

function getExercisesForMuscle(muscle: string): Exercise[] {
  return exerciseDatabase.filter((ex) =>
    ex.targetMuscles.some((target) => 
      target.toLowerCase().includes(muscle.toLowerCase()) ||
      muscle.toLowerCase().includes(target.toLowerCase())
    )
  );
}

function getPriority(severity: SeverityLevel): 'high' | 'medium' | 'low' {
  switch (severity) {
    case 'severe':
      return 'high';
    case 'medium':
      return 'high';
    case 'mild':
      return 'medium';
    default:
      return 'low';
  }
}

export function getExerciseRecommendations(analysis: PostureAnalysis): ExerciseRecommendation[] {
  const recommendations: ExerciseRecommendation[] = [];
  const addedExercises = new Set<string>();

  const metrics = [
    { metric: analysis.headPosition, issue: 'forward head posture', muscles: ['Suboccipitals', 'Deep Neck Flexors', 'Upper Trapezius'] },
    { metric: analysis.shoulderAlignment, issue: 'shoulder alignment', muscles: ['Pectoralis', 'Rhomboids', 'Lower Trapezius'] },
    { metric: analysis.pelvicTilt, issue: 'pelvic tilt', muscles: ['Hip Flexors', 'Gluteus', 'Core'] },
    { metric: analysis.trunkTilt, issue: 'trunk alignment', muscles: ['Core', 'Erector Spinae'] },
    { metric: analysis.kneeAlignment, issue: 'knee alignment', muscles: ['Quadriceps', 'Hamstrings', 'Gastrocnemius'] },
  ];

  metrics.forEach(({ metric, issue, muscles }) => {
    if (metric.severity !== 'normal') {
      muscles.forEach((muscle) => {
        const exercises = getExercisesForMuscle(muscle);
        exercises.forEach((exercise) => {
          if (!addedExercises.has(exercise.id)) {
            addedExercises.add(exercise.id);
            recommendations.push({
              priority: getPriority(metric.severity),
              exercise,
              reason: `Recommended to address ${issue} (${metric.severity})`,
            });
          }
        });
      });
    }
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Limit to top 8 exercises
  return recommendations.slice(0, 8);
}

export function getAllExercises(): Exercise[] {
  return exerciseDatabase;
}
