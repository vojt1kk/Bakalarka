import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Point3D } from '@/types';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export type UsePoseLandmarkerReturn = {
    landmarks: Point3D[] | null;
    isLoading: boolean;
    isRunning: boolean;
    error: string | null;
    start: () => void;
    stop: () => void;
    drawingUtils: DrawingUtils | null;
};

export function usePoseLandmarker(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
): UsePoseLandmarkerReturn {
    const [landmarks, setLandmarks] = useState<Point3D[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const drawingUtilsRef = useRef<DrawingUtils | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef(-1);
    const streamRef = useRef<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsRunning(false);
        setLandmarks(null);
        lastVideoTimeRef.current = -1;
    }, [videoRef]);

    useEffect(() => {
        let cancelled = false;

        async function initLandmarker() {
            setIsLoading(true);
            try {
                const vision = await FilesetResolver.forVisionTasks(WASM_URL);
                if (cancelled) return;

                const landmarker = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: MODEL_URL },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                    minPoseDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                if (cancelled) {
                    landmarker.close();
                    return;
                }

                landmarkerRef.current = landmarker;
            } catch {
                if (!cancelled) {
                    setError('Failed to initialize pose detection model.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        initLandmarker();

        return () => {
            cancelled = true;
            cleanup();
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
            }
        };
    }, [cleanup]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
        }
    }, [canvasRef]);

    const detectLoop = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;

        if (!video || !landmarker || video.paused || video.ended) {
            return;
        }

        if (video.currentTime !== lastVideoTimeRef.current && video.videoWidth > 0) {
            lastVideoTimeRef.current = video.currentTime;

            const result = landmarker.detectForVideo(video, performance.now());
            const poseLandmarks = result.landmarks[0];

            if (poseLandmarks) {
                setLandmarks(
                    poseLandmarks.map((lm: NormalizedLandmark) => ({
                        x: lm.x,
                        y: lm.y,
                        z: lm.z,
                        visibility: lm.visibility ?? 0,
                    })),
                );
            } else {
                setLandmarks(null);
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectLoop);
    }, [videoRef]);

    const start = useCallback(async () => {
        if (!landmarkerRef.current) {
            setError('Pose detection model is not ready yet.');
            return;
        }

        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsRunning(true);
                animationFrameRef.current = requestAnimationFrame(detectLoop);
            }
        } catch {
            setError('Camera access denied. Please allow camera permissions.');
        }
    }, [videoRef, detectLoop]);

    const stop = useCallback(() => {
        cleanup();
    }, [cleanup]);

    return {
        landmarks,
        isLoading,
        isRunning,
        error,
        start,
        stop,
        drawingUtils: drawingUtilsRef.current,
    };
}
