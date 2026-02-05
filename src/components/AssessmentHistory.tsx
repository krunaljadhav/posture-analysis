import React from 'react';
import { Assessment } from '@/types/posture';
import { Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react';

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onSelectAssessment: (assessment: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
}

const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({ 
  assessments, 
  onSelectAssessment,
  onDeleteAssessment 
}) => {
  if (assessments.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mx-auto mb-3 sm:mb-4 flex items-center justify-center">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          No Assessments Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete your first posture assessment to see it here.
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-severity-normal';
    if (score >= 70) return 'bg-severity-mild';
    if (score >= 50) return 'bg-severity-medium';
    return 'bg-severity-severe';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assessment?')) {
      onDeleteAssessment(id);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="clinical-card p-3 sm:p-4 cursor-pointer transition-all hover:shadow-lg hover:border-accent/30 group"
          onClick={() => onSelectAssessment(assessment)}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Thumbnail */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={assessment.imageData} 
                alt="Posture" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground truncate">
                  {assessment.id}
                </span>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${getScoreColor(assessment.analysis.overallScore)}`}></span>
              </div>
              
              <div className="flex items-center text-[10px] sm:text-sm text-muted-foreground space-x-2 sm:space-x-3">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  {new Date(assessment.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  {new Date(assessment.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm font-medium text-foreground mt-0.5 sm:mt-1">
                Score: {assessment.analysis.overallScore}%
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={(e) => handleDelete(e, assessment.id)}
                className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentHistory;
