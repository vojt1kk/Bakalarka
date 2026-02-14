import { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import WebcamView from '@/components/coaching/webcam-view';
import FeedbackPanel from '@/components/coaching/feedback-panel';
import { usePoseLandmarker } from '@/hooks/use-pose-landmarker';
import { useRepCounter } from '@/hooks/use-rep-counter';
import { useExerciseFeedback } from '@/hooks/use-exercise-feedback';
import type { BreadcrumbItem } from '@/types';
import type { ExerciseReference } from '@/types/coaching';

type Exercise = {
    id: number;
    name: string;
    instructions: string;
};

export default function Coach({
    exercise,
    referenceAngles,
}: {
    exercise: Exercise;
    referenceAngles: ExerciseReference;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { landmarks, isLoading, isRunning, error: poseError, start, stop } = usePoseLandmarker(videoRef, canvasRef);
    const { repCount, currentPhase, jointAngles, deviations, processLandmarks, resetCount } =
        useRepCounter(referenceAngles);
    const {
        feedback,
        isLoading: feedbackLoading,
        error: feedbackError,
        requestFeedback,
    } = useExerciseFeedback(exercise.id);

    useEffect(() => {
        if (landmarks) {
            processLandmarks(landmarks);
        }
    }, [landmarks, processLandmarks]);

    useEffect(() => {
        if (isRunning && Object.keys(jointAngles).length > 0 && currentPhase) {
            requestFeedback(jointAngles, deviations, currentPhase, repCount);
        }
    }, [isRunning, jointAngles, deviations, currentPhase, repCount, requestFeedback]);

    const handleStop = () => {
        stop();
        resetCount();
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: exercise.name, href: `/exercises/${exercise.id}` },
        { title: 'Coach', href: `/exercises/${exercise.id}/coach` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Coach - ${exercise.name}`} />

            <div className="mx-auto max-w-6xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{exercise.name}</h1>
                    <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <WebcamView
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            landmarks={landmarks}
                            deviations={deviations}
                            isLoading={isLoading}
                            isRunning={isRunning}
                            error={poseError}
                            onStart={start}
                            onStop={handleStop}
                        />
                    </div>

                    <div>
                        <FeedbackPanel
                            feedback={feedback}
                            isLoading={feedbackLoading}
                            repCount={repCount}
                            currentPhase={currentPhase}
                            error={feedbackError}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
