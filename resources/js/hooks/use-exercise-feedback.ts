import { useCallback, useRef, useState } from 'react';
import type { CoachingFeedback, JointAngles, JointDeviation } from '@/types';

const THROTTLE_MS = 5000;

function flattenDeviations(deviations: JointDeviation[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const d of deviations) {
        result[d.joint] = d.deviation;
    }
    return result;
}

export type UseExerciseFeedbackReturn = {
    feedback: CoachingFeedback | null;
    isLoading: boolean;
    error: string | null;
    requestFeedback: (
        jointAngles: JointAngles,
        deviations: JointDeviation[],
        currentPhase: string,
        repCount: number,
    ) => void;
};

export function useExerciseFeedback(exerciseId: number): UseExerciseFeedbackReturn {
    const [feedback, setFeedback] = useState<CoachingFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastRequestRef = useRef(0);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const requestFeedback = useCallback(
        async (
            jointAngles: JointAngles,
            deviations: JointDeviation[],
            currentPhase: string,
            repCount: number,
        ) => {
            const now = Date.now();
            if (now - lastRequestRef.current < THROTTLE_MS || isLoadingRef.current) {
                return;
            }

            lastRequestRef.current = now;
            isLoadingRef.current = true;

            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/exercises/${exerciseId}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        jointAngles,
                        deviations: flattenDeviations(deviations),
                        currentPhase,
                        repCount,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed: ${response.status}`);
                }

                const data: CoachingFeedback = await response.json();
                setFeedback(data);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return;
                }
                setError('Failed to get coaching feedback.');
            } finally {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        },
        [exerciseId],
    );

    return { feedback, isLoading, error, requestFeedback };
}
