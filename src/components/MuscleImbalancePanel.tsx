import React from 'react';
import { MuscleImbalance, SeverityLevel } from '@/types/posture';
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Activity } from 'lucide-react';

interface MuscleImbalancePanelProps {
  imbalance: MuscleImbalance;
}

const severityColors: Record<SeverityLevel, string> = {
  normal: 'bg-severity-normal/10 text-severity-normal border-severity-normal/30',
  mild: 'bg-severity-mild/10 text-severity-mild border-severity-mild/30',
  medium: 'bg-severity-medium/10 text-severity-medium border-severity-medium/30',
  severe: 'bg-severity-severe/10 text-severity-severe border-severity-severe/30',
};

const MuscleImbalancePanel: React.FC<MuscleImbalancePanelProps> = ({ imbalance }) => {
  const { tightMuscles, weakMuscles, overallBalance } = imbalance;

  const getBalanceColor = (score: number) => {
    if (score >= 80) return 'text-severity-normal';
    if (score >= 60) return 'text-severity-mild';
    if (score >= 40) return 'text-severity-medium';
    return 'text-severity-severe';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overall Balance Score */}
      <div className="clinical-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Muscle Balance Score</h3>
          </div>
          <span className={`text-2xl sm:text-3xl font-bold ${getBalanceColor(overallBalance)}`}>
            {overallBalance}%
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              overallBalance >= 80
                ? 'bg-severity-normal'
                : overallBalance >= 60
                ? 'bg-severity-mild'
                : overallBalance >= 40
                ? 'bg-severity-medium'
                : 'bg-severity-severe'
            }`}
            style={{ width: `${overallBalance}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        {/* Tight Muscles */}
        <div className="clinical-card p-4 sm:p-5">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-severity-medium" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Tight Muscles</h4>
            <span className="text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 rounded-full text-muted-foreground">
              {tightMuscles.length}
            </span>
          </div>

          {tightMuscles.length === 0 ? (
            <div className="flex items-center space-x-2 text-severity-normal">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm">No significant tightness</span>
            </div>
          ) : (
            <div className="space-y-2">
              {tightMuscles.map((muscle, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border ${severityColors[muscle.severity]}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{muscle.name}</p>
                    <p className="text-[10px] sm:text-xs opacity-80 truncate">
                      {muscle.relatedMetrics.join(', ')}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium uppercase flex-shrink-0 ml-2">{muscle.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weak Muscles */}
        <div className="clinical-card p-4 sm:p-5">
          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-severity-mild" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Weak Muscles</h4>
            <span className="text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 rounded-full text-muted-foreground">
              {weakMuscles.length}
            </span>
          </div>

          {weakMuscles.length === 0 ? (
            <div className="flex items-center space-x-2 text-severity-normal">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm">No significant weakness</span>
            </div>
          ) : (
            <div className="space-y-2">
              {weakMuscles.map((muscle, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border ${severityColors[muscle.severity]}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{muscle.name}</p>
                    <p className="text-[10px] sm:text-xs opacity-80 truncate">
                      {muscle.relatedMetrics.join(', ')}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium uppercase flex-shrink-0 ml-2">{muscle.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 sm:p-4">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
              Understanding Muscle Imbalances
            </p>
            <p className="text-[11px] sm:text-sm text-muted-foreground">
              Tight muscles tend to be overactive and shortened, while weak muscles are underactive
              and lengthened. Addressing these through targeted stretching and strengthening can improve posture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleImbalancePanel;
