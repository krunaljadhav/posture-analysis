import React, { useEffect, useRef, useCallback } from 'react';
import { PostureLandmarks, PostureAnalysis, SeverityLevel } from '@/types/posture';

interface PostureCanvasProps {
  imageUrl: string;
  landmarks: PostureLandmarks | null;
  analysis: PostureAnalysis | null;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

const severityColors: Record<SeverityLevel, string> = {
  normal: '#22c55e',
  mild: '#eab308',
  medium: '#f97316',
  severe: '#ef4444',
};

const PostureCanvas: React.FC<PostureCanvasProps> = ({ 
  imageUrl, 
  landmarks, 
  analysis,
  onCanvasReady 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !landmarks) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Draw plumb line from ankle
    if (landmarks.ankle) {
      ctx.setLineDash([10, 5]);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(landmarks.ankle.x, 0);
      ctx.lineTo(landmarks.ankle.x, canvas.height);
      ctx.stroke();
      
      // Horizontal reference
      ctx.beginPath();
      ctx.moveTo(0, landmarks.ankle.y);
      ctx.lineTo(canvas.width, landmarks.ankle.y);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw connection lines between landmarks
    const landmarkArray = [
      landmarks.ear,
      landmarks.shoulder,
      landmarks.hip,
      landmarks.knee,
      landmarks.ankle,
    ].filter(Boolean) as { x: number; y: number; name: string }[];
    
    if (landmarkArray.length > 1) {
      // Determine line color based on overall analysis
      let lineColor = severityColors.normal;
      if (analysis) {
        const maxSeverity = getMaxSeverity(analysis);
        lineColor = severityColors[maxSeverity];
      }
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(landmarkArray[0].x, landmarkArray[0].y);
      
      for (let i = 1; i < landmarkArray.length; i++) {
        ctx.lineTo(landmarkArray[i].x, landmarkArray[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw landmarks
    const landmarkPoints = [
      { point: landmarks.ear, label: 'Ear', metric: analysis?.headPosition },
      { point: landmarks.shoulder, label: 'Shoulder', metric: analysis?.shoulderAlignment },
      { point: landmarks.hip, label: 'Hip', metric: analysis?.pelvicTilt },
      { point: landmarks.knee, label: 'Knee', metric: analysis?.kneeAlignment },
      { point: landmarks.ankle, label: 'Ankle', metric: null },
    ];
    
    landmarkPoints.forEach(({ point, label, metric }) => {
      if (!point) return;
      
      const color = metric ? severityColors[metric.severity] : '#0ea5e9';
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = color + '40';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner dot
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Label with background
      ctx.font = 'bold 12px Inter, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const labelX = point.x + 18;
      const labelY = point.y - 5;
      
      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(labelX - 4, labelY - 12, textWidth + 8, 16);
      
      // Text
      ctx.fillStyle = color;
      ctx.fillText(label, labelX, labelY);
      
      // Draw angle if metric exists
      if (metric && metric.angle !== 0) {
        const angleText = `${metric.angle}°`;
        const angleWidth = ctx.measureText(angleText).width;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(labelX - 4, labelY + 4, angleWidth + 8, 16);
        
        ctx.fillStyle = color;
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(angleText, labelX, labelY + 16);
      }
    });
    
    onCanvasReady(canvas);
  }, [landmarks, analysis, onCanvasReady]);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        drawOverlay();
      } else {
        image.onload = drawOverlay;
      }
    }
  }, [imageUrl, landmarks, analysis, drawOverlay]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Posture"
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <p className="text-xs font-medium text-foreground mb-2">Legend</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-severity-normal mr-1.5"></span>
            <span className="text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-severity-mild mr-1.5"></span>
            <span className="text-muted-foreground">Mild</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-severity-medium mr-1.5"></span>
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-severity-severe mr-1.5"></span>
            <span className="text-muted-foreground">Severe</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-accent mr-1.5"></span>
            <span className="text-muted-foreground">Plumb Line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getMaxSeverity(analysis: PostureAnalysis): SeverityLevel {
  const metrics = [
    analysis.headPosition,
    analysis.shoulderAlignment,
    analysis.pelvicTilt,
    analysis.trunkTilt,
    analysis.kneeAlignment,
  ];
  
  const severityOrder: SeverityLevel[] = ['severe', 'medium', 'mild', 'normal'];
  
  for (const severity of severityOrder) {
    if (metrics.some(m => m.severity === severity)) {
      return severity;
    }
  }
  
  return 'normal';
}

export default PostureCanvas;
