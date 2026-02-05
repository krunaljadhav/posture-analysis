import React, { useState } from 'react';
import { PostureAnalysis, PostureMetric, SeverityLevel } from '@/types/posture';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Dumbbell,
  Users,
  ChevronRight
} from 'lucide-react';
import MuscleImbalancePanel from './MuscleImbalancePanel';
import ExerciseRecommendations from './ExerciseRecommendations';
import ProgressComparison from './ProgressComparison';
import { getAssessments } from '@/lib/assessmentStorage';

interface PostureReportProps {
  analysis: PostureAnalysis;
}

const severityConfig: Record<SeverityLevel, { 
  icon: React.ElementType; 
  className: string;
  bgClass: string;
  label: string;
}> = {
  normal: { 
    icon: CheckCircle, 
    className: 'text-severity-normal',
    bgClass: 'severity-normal',
    label: 'Normal'
  },
  mild: { 
    icon: AlertTriangle, 
    className: 'text-severity-mild',
    bgClass: 'severity-mild',
    label: 'Mild'
  },
  medium: { 
    icon: AlertCircle, 
    className: 'text-severity-medium',
    bgClass: 'severity-medium',
    label: 'Medium'
  },
  severe: { 
    icon: XCircle, 
    className: 'text-severity-severe',
    bgClass: 'severity-severe',
    label: 'Severe'
  },
};

const MetricCard: React.FC<{ metric: PostureMetric }> = ({ metric }) => {
  const config = severityConfig[metric.severity];
  const Icon = config.icon;
  
  return (
    <div className="metric-card animate-fade-in">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.className} bg-current/10`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.className}`} />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">{metric.name}</h4>
            <span className={`severity-badge ${config.bgClass} text-[10px] sm:text-xs`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-xl sm:text-2xl font-bold ${config.className}`}>
            {metric.angle}°
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Normal: {metric.normalRange[0]}° - {metric.normalRange[1]}°
          </p>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
        {metric.description}
      </p>
      
      {metric.severity !== 'normal' && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
          <p className="text-[10px] sm:text-xs font-medium text-accent flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Recommendation
          </p>
          <p className="text-xs sm:text-sm text-foreground mt-1">
            {metric.recommendation}
          </p>
        </div>
      )}
    </div>
  );
};

type TabType = 'overview' | 'extended' | 'muscles' | 'exercises' | 'progress';

const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Activity },
  { id: 'extended', label: 'Detailed Metrics', shortLabel: 'Details', icon: BarChart3 },
  { id: 'muscles', label: 'Muscle Analysis', shortLabel: 'Muscles', icon: Users },
  { id: 'exercises', label: 'Exercises', shortLabel: 'Exercise', icon: Dumbbell },
  { id: 'progress', label: 'Progress', shortLabel: 'Progress', icon: TrendingUp },
];

const PostureReport: React.FC<PostureReportProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const assessments = getAssessments();

  const primaryMetrics = [
    analysis.headPosition,
    analysis.shoulderAlignment,
    analysis.pelvicTilt,
    analysis.trunkTilt,
    analysis.kneeAlignment,
  ];

  const extendedMetrics = analysis.extendedMetrics ? [
    analysis.extendedMetrics.ankleAlignment,
    analysis.extendedMetrics.cervicalLordosis,
    analysis.extendedMetrics.thoracicKyphosis,
    analysis.extendedMetrics.lumbarLordosis,
  ] : [];
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-severity-normal';
    if (score >= 70) return 'text-severity-mild';
    if (score >= 50) return 'text-severity-medium';
    return 'text-severity-severe';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };
  
  const issueCount = primaryMetrics.filter(m => m.severity !== 'normal').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation - Scrollable on mobile */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-muted rounded-lg scrollbar-hide -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Overall Score */}
          <div className="clinical-card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-0.5 sm:mb-1">
                  Overall Posture Score
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Based on {primaryMetrics.length} assessments
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className={`text-4xl sm:text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                  <span className="text-xl sm:text-2xl">%</span>
                </div>
                <p className={`text-xs sm:text-sm font-medium ${getScoreColor(analysis.overallScore)}`}>
                  {getScoreLabel(analysis.overallScore)}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  analysis.overallScore >= 85 ? 'bg-severity-normal' :
                  analysis.overallScore >= 70 ? 'bg-severity-mild' :
                  analysis.overallScore >= 50 ? 'bg-severity-medium' :
                  'bg-severity-severe'
                }`}
                style={{ width: `${analysis.overallScore}%` }}
              />
            </div>
            
            {issueCount > 0 && (
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-muted-foreground">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-accent" />
                {issueCount} area{issueCount > 1 ? 's' : ''} identified for improvement
              </div>
            )}
          </div>
          
          {/* Primary Metrics */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Primary Analysis
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {primaryMetrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button 
              onClick={() => setActiveTab('muscles')}
              className="clinical-card p-3 sm:p-4 text-left hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground text-xs sm:text-sm">Muscle Analysis</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">View imbalances</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent hidden sm:block" />
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('exercises')}
              className="clinical-card p-3 sm:p-4 text-left hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground text-xs sm:text-sm">Exercises</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">
                      {analysis.exerciseRecommendations?.length || 0} recommended
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent hidden sm:block" />
              </div>
            </button>
          </div>

          {/* Summary */}
          <div className="clinical-card p-4 sm:p-5 bg-accent/5 border-accent/20">
            <h4 className="font-semibold text-foreground mb-2 flex items-center text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
              Clinical Summary
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {analysis.overallScore >= 85 
                ? 'Your posture shows excellent alignment. Continue maintaining your current postural habits and regular physical activity.'
                : analysis.overallScore >= 70
                ? 'Your posture is generally good with minor areas for improvement. Focus on the highlighted recommendations for optimal alignment.'
                : analysis.overallScore >= 50
                ? 'Several postural deviations have been identified. Consider consulting a physiotherapist for a personalized exercise program.'
                : 'Significant postural issues detected. We strongly recommend consulting a qualified physiotherapist for a comprehensive assessment and treatment plan.'
              }
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 italic">
              Assessment Date: {analysis.timestamp.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'extended' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          <div className="clinical-card p-3 sm:p-4 bg-accent/5 border-accent/20">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Extended metrics provide deeper insight into spinal curvatures and joint alignments 
              that contribute to your overall posture.
            </p>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
              Extended Metrics
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {extendedMetrics.map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'muscles' && (
        <div className="animate-fade-in">
          {analysis.muscleImbalance ? (
            <MuscleImbalancePanel imbalance={analysis.muscleImbalance} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No muscle imbalance data available
            </div>
          )}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="animate-fade-in">
          {analysis.exerciseRecommendations ? (
            <ExerciseRecommendations recommendations={analysis.exerciseRecommendations} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No exercise recommendations available
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="animate-fade-in">
          <ProgressComparison assessments={assessments} />
        </div>
      )}
    </div>
  );
};

export default PostureReport;
