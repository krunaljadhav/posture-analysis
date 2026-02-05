import { Assessment } from '@/types/posture';

// jsPDF is loaded at runtime via CDN to avoid build-time module resolution issues.
// This keeps `vite build` stable even when certain deps are unavailable in the build environment.

declare global {
  interface Window {
    jspdf?: { jsPDF: any };
  }
}

let jspdfLoaded = false;

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any).__loaded) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      (script as any).__loaded = true;
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

async function ensureJsPDF(): Promise<any> {
  if (!jspdfLoaded) {
    // UMD build that exposes window.jspdf.jsPDF
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
    jspdfLoaded = true;
  }

  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) {
    throw new Error('Failed to initialize PDF engine (jsPDF).');
  }

  return jsPDF;
}

export async function generatePDF(assessment: Assessment, canvasElement: HTMLCanvasElement | null): Promise<void> {
  const jsPDF = await ensureJsPDF();
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Header
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('POSTURE ASSESSMENT REPORT', margin, 20);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const date = new Date(assessment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  pdf.text(`Assessment Date: ${date}`, margin, 28);
  pdf.text(`Report ID: ${assessment.id}`, pageWidth - margin - 50, 28);

  yPosition = 45;

  // Overall Score Section
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Posture Score', margin, yPosition);

  yPosition += 8;

  const score = assessment.analysis.overallScore;
  let scoreColor: [number, number, number] = [34, 197, 94]; // green
  if (score < 50) scoreColor = [239, 68, 68]; // red
  else if (score < 70) scoreColor = [249, 115, 22]; // orange
  else if (score < 85) scoreColor = [234, 179, 8]; // yellow

  pdf.setFillColor(...scoreColor);
  pdf.roundedRect(margin, yPosition, 30, 15, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${score}%`, margin + 8, yPosition + 10);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(getScoreDescription(score), margin + 35, yPosition + 10);

  yPosition += 25;

  // Annotated Image
  if (canvasElement) {
    try {
      const imgData = canvasElement.toDataURL('image/jpeg', 0.85);
      const imgWidth = 80;
      const imgHeight = (canvasElement.height / canvasElement.width) * imgWidth;

      pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, Math.min(imgHeight, 100));

      // Analysis results next to image
      const analysisX = margin + imgWidth + 10;
      let analysisY = yPosition;

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis Results', analysisX, analysisY);
      analysisY += 8;

      const metrics = [
        assessment.analysis.headPosition,
        assessment.analysis.shoulderAlignment,
        assessment.analysis.pelvicTilt,
        assessment.analysis.trunkTilt,
        assessment.analysis.kneeAlignment,
      ];

      metrics.forEach((metric: any) => {
        const color = getSeverityColor(metric.severity);
        pdf.setFillColor(...color);
        pdf.circle(analysisX + 2, analysisY - 1, 2, 'F');

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(metric.name, analysisX + 6, analysisY);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${metric.angle}°`, analysisX + 75, analysisY);

        analysisY += 4;
        pdf.setFontSize(8);
        pdf.text(metric.description, analysisX + 6, analysisY);
        analysisY += 8;
      });

      yPosition += Math.max(Math.min(imgHeight, 100), 70) + 10;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Detailed Findings
  yPosition = Math.min(yPosition, pageHeight - 80);

  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recommendations', margin, yPosition);
  yPosition += 6;

  const recommendations = [
    assessment.analysis.headPosition,
    assessment.analysis.shoulderAlignment,
    assessment.analysis.pelvicTilt,
    assessment.analysis.trunkTilt,
    assessment.analysis.kneeAlignment,
  ].filter((m: any) => m.severity !== 'normal');

  if (recommendations.length === 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(34, 197, 94);
    pdf.text('Excellent posture! Continue maintaining your current alignment.', margin, yPosition + 5);
  } else {
    recommendations.forEach((metric: any) => {
      if (yPosition > pageHeight - 30) return;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`• ${metric.name}:`, margin, yPosition + 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(metric.recommendation, margin + 5, yPosition + 10);
      yPosition += 12;
    });
  }

  // Footer
  pdf.setFillColor(241, 245, 249);
  pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Generated by PhysioCode Posture Assessment System', margin, pageHeight - 6);
  pdf.text('For professional medical advice, please consult a licensed physiotherapist', pageWidth - margin - 85, pageHeight - 6);

  // Save
  pdf.save(`posture-report-${assessment.id}.pdf`);
}

function getScoreDescription(score: number): string {
  if (score >= 85) return 'Excellent - Optimal postural alignment';
  if (score >= 70) return 'Good - Minor adjustments recommended';
  if (score >= 50) return 'Fair - Several areas need attention';
  return 'Needs Improvement - Multiple postural issues detected';
}

function getSeverityColor(severity: string): [number, number, number] {
  switch (severity) {
    case 'normal':
      return [34, 197, 94];
    case 'mild':
      return [234, 179, 8];
    case 'medium':
      return [249, 115, 22];
    case 'severe':
      return [239, 68, 68];
    default:
      return [148, 163, 184];
  }
}
