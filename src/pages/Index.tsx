import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import PostureCanvas from '@/components/PostureCanvas';
import PostureReport from '@/components/PostureReport';
import AssessmentHistory from '@/components/AssessmentHistory';
import { detectPose, initializePoseDetector } from '@/lib/poseDetection';
import { analyzePosture } from '@/lib/postureAnalysis';
import { generatePDF } from '@/lib/pdfGenerator';
import { saveAssessment, getAssessments, deleteAssessment, generateAssessmentId } from '@/lib/assessmentStorage';
import { Assessment, PostureLandmarks, PostureAnalysis } from '@/types/posture';
import { 
  Download, 
  RotateCcw, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assess' | 'history'>('assess');
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [landmarks, setLandmarks] = useState<PostureLandmarks | null>(null);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  // Initialize pose detector on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializePoseDetector();
        setIsModelLoading(false);
        toast({
          title: "AI Model Ready",
          description: "Pose detection model loaded successfully.",
        });
      } catch (err) {
        console.error('Failed to initialize pose detector:', err);
        setError('Failed to load AI model. Please refresh the page.');
        setIsModelLoading(false);
      }
    };
    
    init();
    setAssessments(getAssessments());
  }, [toast]);

  const handleImageSelect = useCallback(async (file: File, url: string) => {
    setImageFile(file);
    setImageUrl(url);
    setError(null);
    setLandmarks(null);
    setAnalysis(null);
    setIsProcessing(true);
    
    try {
      // Create image element for processing
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      
      // Detect pose landmarks
      const detectedLandmarks = await detectPose(img);
      setLandmarks(detectedLandmarks);
      
      // Analyze posture
      const postureAnalysis = analyzePosture(detectedLandmarks);
      setAnalysis(postureAnalysis);
      
      // Save assessment
      const assessment: Assessment = {
        id: generateAssessmentId(),
        imageData: url,
        landmarks: detectedLandmarks,
        analysis: postureAnalysis,
        createdAt: new Date(),
      };
      
      saveAssessment(assessment);
      setAssessments(getAssessments());
      
      toast({
        title: "Assessment Complete",
        description: `Posture score: ${postureAnalysis.overallScore}%`,
      });
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      toast({
        title: "Processing Error",
        description: err instanceof Error ? err.message : 'Failed to process image',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    setImageUrl(null);
    setImageFile(null);
    setLandmarks(null);
    setAnalysis(null);
    setError(null);
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!analysis || !landmarks || !imageUrl) return;
    
    try {
      const assessment: Assessment = {
        id: generateAssessmentId(),
        imageData: imageUrl,
        landmarks,
        analysis,
        createdAt: new Date(),
      };
      
      await generatePDF(assessment, canvasRef.current);
      
      toast({
        title: "PDF Generated",
        description: "Your posture report has been downloaded.",
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast({
        title: "PDF Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  }, [analysis, landmarks, imageUrl, toast]);

  const handleSelectAssessment = useCallback((assessment: Assessment) => {
    setImageUrl(assessment.imageData);
    setLandmarks(assessment.landmarks);
    setAnalysis(assessment.analysis);
    setActiveTab('assess');
  }, []);

  const handleDeleteAssessment = useCallback((id: string) => {
    deleteAssessment(id);
    setAssessments(getAssessments());
    toast({
      title: "Assessment Deleted",
      description: "The assessment has been removed.",
    });
  }, [toast]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  return (
    <div>
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isModelLoading={isModelLoading}
      />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {activeTab === 'assess' ? (
          <div className="max-w-6xl mx-auto">
            {!imageUrl ? (
              <div className="max-w-2xl mx-auto animate-fade-in">
                {/* Hero Section */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    AI-Powered Analysis
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                    Posture Code
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto px-4">
                    Upload a side-view standing photo for comprehensive postural analysis using advanced AI.
                  </p>
                </div>
                
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  isProcessing={isProcessing || isModelLoading}
                />
                
                {isModelLoading && (
                  <div className="mt-4 sm:mt-6 flex items-center justify-center text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                    Initializing AI model...
                  </div>
                )}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 animate-fade-in">
                {/* Left: Image with overlays */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                      Annotated Image
                    </h2>
                    <button
                      onClick={handleReset}
                      className="btn-clinical-outline text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                    >
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden xs:inline">New </span>Reset
                    </button>
                  </div>
                  
                  {isProcessing ? (
                    <div className="clinical-card p-8 sm:p-12 text-center">
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-accent mx-auto mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg font-medium text-foreground">Analyzing posture...</p>
                      <p className="text-sm text-muted-foreground">Detecting landmarks and calculating angles</p>
                    </div>
                  ) : error ? (
                    <div className="clinical-card p-6 sm:p-8 text-center border-destructive/50">
                      <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-destructive mx-auto mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg font-medium text-foreground mb-2">Analysis Failed</p>
                      <p className="text-sm text-muted-foreground mb-4">{error}</p>
                      <button onClick={handleReset} className="btn-clinical text-sm">
                        Try Again
                      </button>
                    </div>
                  ) : landmarks ? (
                    <PostureCanvas
                      imageUrl={imageUrl}
                      landmarks={landmarks}
                      analysis={analysis}
                      onCanvasReady={handleCanvasReady}
                    />
                  ) : (
                    <div className="clinical-card overflow-hidden">
                      <img src={imageUrl} alt="Uploaded" className="w-full h-auto" />
                    </div>
                  )}
                </div>
                
                {/* Right: Report */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                      Assessment Report
                    </h2>
                    {analysis && (
                      <button
                        onClick={handleDownloadPDF}
                        className="btn-clinical text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full xs:w-auto"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Download PDF
                      </button>
                    )}
                  </div>
                  
                  {isProcessing ? (
                    <div className="clinical-card p-6 sm:p-8">
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-16 sm:h-20 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : analysis ? (
                    <PostureReport analysis={analysis} />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Assessment History</h2>
              <p className="text-sm text-muted-foreground">View and compare your previous posture assessments</p>
            </div>
            
            <AssessmentHistory
              assessments={assessments}
              onSelectAssessment={handleSelectAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border mt-8 sm:mt-12 py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            PhysioCode Posture Assessment System • For educational purposes only
          </p>
          <p className="mt-1">
            Always consult a qualified physiotherapist for professional medical advice
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
