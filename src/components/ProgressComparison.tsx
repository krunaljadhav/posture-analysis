import React, { useMemo } from 'react';
import { Assessment } from '@/types/posture';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';

interface ProgressComparisonProps {
  assessments: Assessment[];
}

const ProgressComparison: React.FC<ProgressComparisonProps> = ({ assessments }) => {
  const progressData = useMemo(() => {
    return assessments
      .slice()
      .reverse()
      .map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(a.createdAt),
        overallScore: a.analysis.overallScore,
        headPosition: Math.abs(a.analysis.headPosition.angle),
        shoulderAlignment: Math.abs(a.analysis.shoulderAlignment.angle),
        pelvicTilt: a.analysis.pelvicTilt.angle,
        trunkTilt: Math.abs(a.analysis.trunkTilt.angle),
        kneeAlignment: Math.abs(180 - a.analysis.kneeAlignment.angle),
      }));
  }, [assessments]);

  const latestScore = progressData.length > 0 ? progressData[progressData.length - 1].overallScore : 0;
  const previousScore = progressData.length > 1 ? progressData[progressData.length - 2].overallScore : latestScore;
  const scoreChange = latestScore - previousScore;

  const averageScore = useMemo(() => {
    if (progressData.length === 0) return 0;
    return Math.round(progressData.reduce((sum, d) => sum + d.overallScore, 0) / progressData.length);
  }, [progressData]);

  const bestScore = useMemo(() => {
    if (progressData.length === 0) return 0;
    return Math.max(...progressData.map((d) => d.overallScore));
  }, [progressData]);

  if (assessments.length < 2) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mx-auto mb-3 sm:mb-4 flex items-center justify-center">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Not Enough Data Yet
        </h3>
        <p className="text-sm text-muted-foreground px-4">
          Complete at least 2 assessments to see your progress over time.
        </p>
      </div>
    );
  }

  const TrendIcon = scoreChange > 0 ? TrendingUp : scoreChange < 0 ? TrendingDown : Minus;
  const trendColor = scoreChange > 0 ? 'text-severity-normal' : scoreChange < 0 ? 'text-severity-severe' : 'text-muted-foreground';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="clinical-card p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Latest</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{latestScore}%</p>
          <div className={`flex items-center justify-center mt-0.5 sm:mt-1 ${trendColor}`}>
            <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
            <span className="text-[10px] sm:text-sm font-medium">
              {scoreChange > 0 ? '+' : ''}{scoreChange}%
            </span>
          </div>
        </div>
        <div className="clinical-card p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Average</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{averageScore}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            {assessments.length} total
          </p>
        </div>
        <div className="clinical-card p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Best</p>
          <p className="text-2xl sm:text-3xl font-bold text-severity-normal">{bestScore}%</p>
          <div className="flex items-center justify-center mt-0.5 sm:mt-1 text-muted-foreground">
            <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            <span className="text-[10px] sm:text-xs">Personal best</span>
          </div>
        </div>
      </div>

      {/* Overall Score Chart */}
      <div className="clinical-card p-3 sm:p-5">
        <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Overall Score Trend</h4>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="overallScore"
                name="Score"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics Chart */}
      <div className="clinical-card p-3 sm:p-5">
        <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Metric Deviations</h4>
        <p className="text-[10px] sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Lower values = better alignment
        </p>
        <div className="h-56 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                stroke="hsl(var(--muted-foreground))"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px' }}
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="headPosition"
                name="Head"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="shoulderAlignment"
                name="Shoulder"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="trunkTilt"
                name="Trunk"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="kneeAlignment"
                name="Knee"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="clinical-card p-3 sm:p-5 bg-accent/5 border-accent/20">
        <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Progress Insights</h4>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
          {scoreChange > 5 && (
            <li className="flex items-start">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-severity-normal mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              Great progress! Your posture improved by {scoreChange}% since last assessment.
            </li>
          )}
          {scoreChange < -5 && (
            <li className="flex items-start">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-severity-severe mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              Score decreased by {Math.abs(scoreChange)}%. Review the exercise recommendations.
            </li>
          )}
          {assessments.length >= 5 && (
            <li className="flex items-start">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              You've completed {assessments.length} assessments. Consistent tracking helps!
            </li>
          )}
          <li className="flex items-start">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
            Your best score is {bestScore}%. Focus on maintaining good posture habits.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProgressComparison;
