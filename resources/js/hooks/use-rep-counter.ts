import { useCallback, useRef, useState } from 'react';
import type { ExerciseReference, JointAngles, JointDeviation, Point3D } from '@/types';
import { detectDeviations, extractJointAngles } from '@/lib/pose-detection';

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

    const phaseNames = Object.keys(reference.phases);

    const detectPhase = useCallback(
        (angles: JointAngles): string => {
            let bestPhase = '';
            let bestScore = Infinity;

            for (const [phaseName, phaseRef] of Object.entries(reference.phases)) {
                let totalDeviation = 0;
                let jointCount = 0;

                for (const [joint, range] of Object.entries(phaseRef)) {
                    if (angles[joint] !== undefined) {
                        totalDeviation += Math.abs(angles[joint] - range.ideal);
                        jointCount++;
                    }
                }

                if (jointCount > 0) {
                    const avgDeviation = totalDeviation / jointCount;
                    if (avgDeviation < bestScore) {
                        bestScore = avgDeviation;
                        bestPhase = phaseName;
                    }
                }
            }

            return bestPhase;
        },
        [reference.phases],
    );

    const processLandmarks = useCallback(
        (landmarks: Point3D[]) => {
            const angles = extractJointAngles(landmarks);
            setJointAngles(angles);

            const phase = detectPhase(angles);
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
        [detectPhase, reference.phases, phaseNames],
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
