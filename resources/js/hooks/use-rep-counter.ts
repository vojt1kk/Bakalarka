import { useCallback, useMemo, useRef, useState } from 'react';
import { detectDeviations, detectPhase, extractJointAngles } from '@/lib/pose-detection';
import type { ExerciseReference, JointAngles, JointDeviation, Point3D } from '@/types';

export type UseRepCounterReturn = {
    repCount: number;
    currentPhase: string;
    jointAngles: JointAngles;
    deviations: JointDeviation[];
    resetCount: () => void;
    processLandmarks: (landmarks: Point3D[]) => void;
};

export function useRepCounter(reference: ExerciseReference): UseRepCounterReturn {
    const [repCount, setRepCount] = useState(0);
    const [currentPhase, setCurrentPhase] = useState('');
    const [jointAngles, setJointAngles] = useState<JointAngles>({});
    const [deviations, setDeviations] = useState<JointDeviation[]>([]);

    const previousPhaseRef = useRef<string>('');

    const phaseNames = useMemo(() => Object.keys(reference.phases), [reference.phases]);

    const processLandmarks = useCallback(
        (landmarks: Point3D[]) => {
            const angles = extractJointAngles(landmarks);
            setJointAngles(angles);

            const phase = detectPhase(angles, reference.phases);
            setCurrentPhase(phase);

            const phaseRef = reference.phases[phase];
            if (phaseRef) {
                setDeviations(detectDeviations(angles, phaseRef));
            }

            // Count a rep when we complete a full cycle (last phase -> first phase)
            if (
                phaseNames.length >= 2 &&
                previousPhaseRef.current === phaseNames[phaseNames.length - 1] &&
                phase === phaseNames[0]
            ) {
                setRepCount((prev) => prev + 1);
            }

            previousPhaseRef.current = phase;
        },
        [reference.phases, phaseNames],
    );

    const resetCount = useCallback(() => {
        setRepCount(0);
        setCurrentPhase('');
        setJointAngles({});
        setDeviations([]);
        previousPhaseRef.current = '';
    }, []);

    return {
        repCount,
        currentPhase,
        jointAngles,
        deviations,
        resetCount,
        processLandmarks,
    };
}
