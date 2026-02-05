import { PostureLandmarks, Landmark } from '@/types/posture';

// MediaPipe Pose (browser) loader + inference for still images.
// We use CDN scripts to avoid bundler resolution issues in build.

type MPResults = {
  poseLandmarks?: Array<{ x: number; y: number; z?: number; visibility?: number; presence?: number }>;
};

declare global {
  interface Window {
    Pose?: any;
  }
}

let poseInstance: any | null = null;
let scriptsLoaded = false;

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

export async function initializePoseDetector(): Promise<void> {
  if (poseInstance) return;

  // Load MediaPipe Pose runtime
  if (!scriptsLoaded) {
    // Pose depends on some internal wasm/assets; locateFile handles that.
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
    scriptsLoaded = true;
  }

  if (!window.Pose) {
    throw new Error('MediaPipe Pose failed to initialize.');
  }

  poseInstance = new window.Pose({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  // Side-view still image: enable high accuracy, no need for tracking.
  poseInstance.setOptions({
    modelComplexity: 2,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export async function detectPose(imageElement: HTMLImageElement): Promise<PostureLandmarks> {
  if (!poseInstance) {
    await initializePoseDetector();
  }

  const width = imageElement.naturalWidth;
  const height = imageElement.naturalHeight;

  const results: MPResults = await new Promise((resolve, reject) => {
    const onResults = (r: MPResults) => resolve(r);

    // MediaPipe Pose supports a single onResults handler
    poseInstance.onResults(onResults);

    poseInstance
      .send({ image: imageElement })
      .catch((err: any) => reject(err));
  });

  if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
    throw new Error('No pose detected in the image. Please ensure the full body is visible.');
  }

  const lm = results.poseLandmarks;

  const pickSide = (leftIdx: number, rightIdx: number): number => {
    const leftVis = lm[leftIdx]?.visibility ?? 0;
    const rightVis = lm[rightIdx]?.visibility ?? 0;
    return leftVis >= rightVis ? leftIdx : rightIdx;
  };

  const toLandmark = (idx: number, name: string): Landmark | null => {
    const p = lm[idx];
    const vis = p?.visibility ?? 0;
    if (!p || vis < 0.3) return null;
    return {
      name,
      x: p.x * width,
      y: p.y * height,
      score: vis,
    };
  };

  // MediaPipe Pose landmark indices (BlazePose)
  const earIdx = pickSide(7, 8);
  const shoulderIdx = pickSide(11, 12);
  const hipIdx = pickSide(23, 24);
  const kneeIdx = pickSide(25, 26);
  const ankleIdx = pickSide(27, 28);

  const ear = toLandmark(earIdx, 'ear');
  const shoulder = toLandmark(shoulderIdx, 'shoulder');
  const hip = toLandmark(hipIdx, 'hip');
  const knee = toLandmark(kneeIdx, 'knee');
  const ankle = toLandmark(ankleIdx, 'ankle');

  // Note: ASIS/PSIS cannot be detected from pose estimation
  // Pelvic tilt is now calculated using hip-shoulder-knee relationship in postureAnalysis.ts
  // These are kept as null for interface compatibility

  return {
    ear,
    shoulder,
    hip,
    knee,
    ankle,
    asis: null,
    psis: null,
  };
}

export function isDetectorReady(): boolean {
  return poseInstance !== null;
}

