import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FrameSize, Point3D } from '@/types';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export type UsePoseLandmarkerReturn = {
    landmarks: Point3D[] | null;
    isLoading: boolean;
    isRunning: boolean;
    isVideoFile: boolean;
    isGif: boolean;
    mediaAspectRatio: number;
    error: string | null;
    start: () => void;
    startWithFile: (file: File) => void;
    stop: () => void;
    drawingUtils: DrawingUtils | null;
};

export type PoseFrameHandler = (landmarks: Point3D[], mediaTimestampMs: number, frame: FrameSize) => void;

const DEFAULT_GIF_FRAME_MS = 100;
const CAMERA_ASPECT_RATIO = 640 / 480;

function toPoints(poseLandmarks: NormalizedLandmark[]): Point3D[] {
    return poseLandmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 0,
    }));
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export function usePoseLandmarker(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    gifCanvasRef: React.RefObject<HTMLCanvasElement | null>,
    onFrame?: PoseFrameHandler,
): UsePoseLandmarkerReturn {
    const [landmarks, setLandmarks] = useState<Point3D[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isVideoFile, setIsVideoFile] = useState(false);
    const [isGif, setIsGif] = useState(false);
    const [mediaAspectRatio, setMediaAspectRatio] = useState(CAMERA_ASPECT_RATIO);
    const [error, setError] = useState<string | null>(null);

    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const drawingUtilsRef = useRef<DrawingUtils | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef(-1);
    const streamRef = useRef<MediaStream | null>(null);
    const videoUrlRef = useRef<string | null>(null);
    const gifSessionRef = useRef(0);
    const lastDetectionTsRef = useRef(0);
    const onFrameRef = useRef<PoseFrameHandler | undefined>(onFrame);

    useEffect(() => {
        onFrameRef.current = onFrame;
    }, [onFrame]);

    const detect = useCallback((source: HTMLVideoElement | HTMLCanvasElement, mediaTimestampMs: number) => {
        const landmarker = landmarkerRef.current;
        if (!landmarker) {
            return;
        }

        const detectionTs = Math.max(performance.now(), lastDetectionTsRef.current + 1);
        lastDetectionTsRef.current = detectionTs;

        const poseLandmarks = landmarker.detectForVideo(source, detectionTs).landmarks[0];

        if (poseLandmarks) {
            const points = toPoints(poseLandmarks);
            setLandmarks(points);
            const frame: FrameSize =
                source instanceof HTMLVideoElement
                    ? { width: source.videoWidth, height: source.videoHeight }
                    : { width: source.width, height: source.height };
            onFrameRef.current?.(points, mediaTimestampMs, frame);
        } else {
            setLandmarks(null);
        }
    }, []);

    const cleanup = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }

        gifSessionRef.current++;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = '';
        }

        setIsRunning(false);
        setIsVideoFile(false);
        setIsGif(false);
        setMediaAspectRatio(CAMERA_ASPECT_RATIO);
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

            const mediaTimestampMs = video.srcObject === null ? video.currentTime * 1000 : performance.now();
            detect(video, mediaTimestampMs);
        }

        animationFrameRef.current = requestAnimationFrame(detectLoop);
    }, [videoRef, detect]);

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

    const playGif = useCallback(
        async (file: File) => {
            const canvas = gifCanvasRef.current;
            const context = canvas?.getContext('2d');

            if (typeof ImageDecoder === 'undefined' || !(await ImageDecoder.isTypeSupported('image/gif'))) {
                setError('Tento prohlížeč neumí dekódovat GIF (WebCodecs ImageDecoder). Použij Chrome/Edge přes HTTPS (např. herd secure).');
                return;
            }

            if (!canvas || !context) {
                return;
            }

            const session = gifSessionRef.current;
            const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type: 'image/gif' });

            try {
                await decoder.tracks.ready;
                await decoder.completed;

                const frameCount = decoder.tracks.selectedTrack?.frameCount ?? 0;
                if (frameCount === 0 || session !== gifSessionRef.current) {
                    return;
                }

                setIsGif(true);
                setIsVideoFile(true);
                setIsRunning(true);

                const startedAt = performance.now();
                let mediaTimestampMs = 0;

                for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
                    const { image } = await decoder.decode({ frameIndex });

                    if (session !== gifSessionRef.current) {
                        image.close();
                        return;
                    }

                    if (canvas.width !== image.displayWidth || canvas.height !== image.displayHeight) {
                        canvas.width = image.displayWidth;
                        canvas.height = image.displayHeight;
                        setMediaAspectRatio(image.displayWidth / image.displayHeight);
                    }
                    context.drawImage(image, 0, 0);
                    detect(canvas, mediaTimestampMs);

                    const durationMs = (image.duration ?? 0) / 1000;
                    image.close();
                    mediaTimestampMs += durationMs > 10 ? durationMs : DEFAULT_GIF_FRAME_MS;

                    await wait(startedAt + mediaTimestampMs - performance.now());
                }

                if (session === gifSessionRef.current) {
                    setIsRunning(false);
                    setLandmarks(null);
                }
            } catch {
                if (session === gifSessionRef.current) {
                    setError('GIF se nepodařilo dekódovat.');
                    setIsRunning(false);
                }
            } finally {
                decoder.close();
            }
        },
        [gifCanvasRef, detect],
    );

    const startWithFile = useCallback(
        async (file: File) => {
            if (!landmarkerRef.current) {
                setError('Pose detection model is not ready yet.');
                return;
            }

            cleanup();

            if (file.type === 'image/gif') {
                setError(null);
                await playGif(file);
                return;
            }

            setError(null);
            setIsVideoFile(true);

            const url = URL.createObjectURL(file);
            videoUrlRef.current = url;

            const video = videoRef.current;
            if (!video) {
                return;
            }

            video.src = url;
            video.loop = false;

            const onEnded = () => {
                setIsRunning(false);
                setLandmarks(null);
                video.removeEventListener('ended', onEnded);
            };

            video.addEventListener('ended', onEnded);

            await video.play();
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                setMediaAspectRatio(video.videoWidth / video.videoHeight);
            }
            setIsRunning(true);
            animationFrameRef.current = requestAnimationFrame(detectLoop);
        },
        [videoRef, cleanup, detectLoop, playGif],
    );

    const stop = useCallback(() => {
        cleanup();
    }, [cleanup]);

    return {
        landmarks,
        isLoading,
        isRunning,
        isVideoFile,
        isGif,
        mediaAspectRatio,
        error,
        start,
        startWithFile,
        stop,
        drawingUtils: drawingUtilsRef.current,
    };
}
