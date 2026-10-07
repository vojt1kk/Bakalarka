import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { extractJointAngles, extractKeyPoints } from '@/lib/pose-detection';
import { createRepDetector } from '@/lib/rep-detector';
import type { ExerciseReference, FrameSize, Point3D, RepDetectorState, RepFeedback, RepFeedbackPayload } from '@/types';

export type UseRepFeedbackReturn = {
    repCount: number;
    state: RepDetectorState;
    lastFeedback: RepFeedback | null;
    isLoading: boolean;
    error: string | null;
    isReady: boolean;
    readyError: string | null;
    retryReady: () => void;
    processLandmarks: (landmarks: Point3D[], timestampMs: number, frame: FrameSize) => void;
    flush: () => void;
    reset: () => void;
};

export function useRepFeedback(exerciseId: number, reference: ExerciseReference): UseRepFeedbackReturn {
    const [repCount, setRepCount] = useState(0);
    const [state, setState] = useState<RepDetectorState>('calibrating');
    const [lastFeedback, setLastFeedback] = useState<RepFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHealthy, setIsHealthy] = useState(false);
    const [readyError, setReadyError] = useState<string | null>(null);
    const [healthAttempt, setHealthAttempt] = useState(0);

    const supportsFeedback = reference.tempo !== undefined;
    const isReady = !supportsFeedback || isHealthy;

    const detector = useMemo(
        () => (reference.tempo !== undefined ? createRepDetector() : null),
        [reference],
    );

    useEffect(() => {
        if (!supportsFeedback) {
            return;
        }

        const controller = new AbortController();
        setIsHealthy(false);
        setReadyError(null);

        fetch(`/api/exercises/${exerciseId}/rep-feedback/health`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Health check failed: ${response.status}`);
                }
                setIsHealthy(true);
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                setReadyError('AI zpětná vazba není dostupná.');
            });

        return () => controller.abort();
    }, [exerciseId, supportsFeedback, healthAttempt]);

    const retryReady = useCallback(() => setHealthAttempt((attempt) => attempt + 1), []);

    const isLoadingRef = useRef(false);
    const pendingSummaryRef = useRef<RepFeedbackPayload | null>(null);
    const frameSizeRef = useRef<FrameSize>({ width: 0, height: 0 });
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendSummary = useCallback(
        async (summary: RepFeedbackPayload) => {
            if (isLoadingRef.current) {
                pendingSummaryRef.current = summary;
                return;
            }

            isLoadingRef.current = true;
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setError(null);

            try {
                let next: RepFeedbackPayload | null = summary;

                while (next !== null) {
                    pendingSummaryRef.current = null;

                    try {
                        const response = await fetch(`/api/exercises/${exerciseId}/rep-feedback`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                            },
                            body: JSON.stringify(next),
                            signal: controller.signal,
                        });

                        if (!response.ok) {
                            throw new Error(`Request failed: ${response.status}`);
                        }

                        const data: RepFeedback = await response.json();
                        setLastFeedback(data);
                    } catch (err) {
                        if (err instanceof DOMException && err.name === 'AbortError') {
                            return;
                        }
                        setError('Nepodařilo se získat zpětnou vazbu k opakování.');
                    }

                    next = pendingSummaryRef.current;
                }
            } finally {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        },
        [exerciseId],
    );

    const processLandmarks = useCallback(
        (landmarks: Point3D[], timestampMs: number, frame: FrameSize) => {
            if (detector === null || !isReady) {
                return;
            }

            frameSizeRef.current = frame;
            const summary = detector.update(extractJointAngles(landmarks), timestampMs, extractKeyPoints(landmarks));
            setState(detector.getState());
            setRepCount(detector.getCompletedReps());

            if (summary !== null) {
                void sendSummary({ ...summary, frame: frameSizeRef.current });
            }
        },
        [detector, sendSummary, isReady],
    );

    const flush = useCallback(() => {
        const summary = detector?.flush() ?? null;

        if (summary !== null) {
            void sendSummary({ ...summary, frame: frameSizeRef.current });
        }
    }, [detector, sendSummary]);

    const reset = useCallback(() => {
        abortControllerRef.current?.abort();
        pendingSummaryRef.current = null;
        detector?.reset();
        setRepCount(0);
        setState('calibrating');
        setLastFeedback(null);
        setError(null);
    }, [detector]);

    useEffect(() => () => abortControllerRef.current?.abort(), []);

    return {
        repCount,
        state,
        lastFeedback,
        isLoading,
        error,
        isReady,
        readyError,
        retryReady,
        processLandmarks,
        flush,
        reset,
    };
}
