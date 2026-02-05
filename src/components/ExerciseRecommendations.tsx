import React, { useState } from 'react';
import { ExerciseRecommendation } from '@/types/posture';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Repeat, 
  Target,
  Star,
  Dumbbell,
  Zap,
  Move
} from 'lucide-react';

interface ExerciseRecommendationsProps {
  recommendations: ExerciseRecommendation[];
}

const priorityConfig = {
  high: { label: 'High', className: 'bg-severity-severe/10 text-severity-severe border-severity-severe/30' },
  medium: { label: 'Medium', className: 'bg-severity-mild/10 text-severity-mild border-severity-mild/30' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground border-border' },
};

const categoryIcons = {
  stretch: Move,
  strengthen: Dumbbell,
  mobility: Zap,
};

const ExerciseCard: React.FC<{ 
  recommendation: ExerciseRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ recommendation, isExpanded, onToggle }) => {
  const { exercise, priority, reason } = recommendation;
  const CategoryIcon = categoryIcons[exercise.category];
  const config = priorityConfig[priority];

  return (
    <div className="clinical-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex items-start justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">{exercise.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">{exercise.name}</h4>
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full border ${config.className}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center">
                <CategoryIcon className="w-3 h-3 mr-0.5 sm:mr-1" />
                {exercise.category}
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 mr-0.5 sm:mr-1" />
                {exercise.difficulty}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{exercise.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 ml-2" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-border mt-2">
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {/* Duration and Reps */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium truncate">{exercise.duration}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                <span className="text-muted-foreground">Reps:</span>
                <span className="font-medium truncate">{exercise.reps}</span>
              </div>
            </div>

            {/* Target Muscles */}
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm mb-2">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                <span className="font-medium text-foreground">Target Muscles:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {exercise.targetMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-accent/10 text-accent"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <p className="font-medium text-foreground text-xs sm:text-sm mb-2">Instructions:</p>
              <ol className="space-y-1.5 sm:space-y-2">
                {exercise.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent/10 text-accent text-[10px] sm:text-xs flex items-center justify-center mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Reason */}
            <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-muted-foreground italic">{reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExerciseRecommendations: React.FC<ExerciseRecommendationsProps> = ({ recommendations }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-severity-normal/10 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-severity-normal" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Excellent Posture!
        </h3>
        <p className="text-sm text-muted-foreground">
          No specific exercises needed. Keep up the great work!
        </p>
      </div>
    );
  }

  const groupedByCategory = recommendations.reduce((acc, rec) => {
    const cat = rec.exercise.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rec);
    return acc;
  }, {} as Record<string, ExerciseRecommendation[]>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <div className="clinical-card p-3 sm:p-4 bg-accent/5 border-accent/20">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Based on your posture analysis, we've identified <strong>{recommendations.length} exercises</strong> that 
          can help address your specific imbalances. Focus on high-priority exercises first.
        </p>
      </div>

      {/* Category Tabs */}
      {Object.entries(groupedByCategory).map(([category, recs]) => {
        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
        return (
          <div key={category}>
            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
              <CategoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              <h4 className="font-semibold text-foreground capitalize text-sm sm:text-base">{category} Exercises</h4>
              <span className="text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 rounded-full text-muted-foreground">
                {recs.length}
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recs.map((rec) => {
                const globalIndex = recommendations.indexOf(rec);
                return (
                  <ExerciseCard
                    key={rec.exercise.id}
                    recommendation={rec}
                    isExpanded={expandedIndex === globalIndex}
                    onToggle={() => setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExerciseRecommendations;
