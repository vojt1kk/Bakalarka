import { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WebcamView from '@/components/coaching/webcam-view';
import FeedbackPanel from '@/components/coaching/feedback-panel';
import { usePoseLandmarker } from '@/hooks/use-pose-landmarker';
import { useRepCounter } from '@/hooks/use-rep-counter';
import { useExerciseFeedback } from '@/hooks/use-exercise-feedback';
import { dashboard, exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { ExerciseReference } from '@/types/coaching';

type Exercise = {
    id: number;
    name: string;
    description: string;
    instructions: string | null;
    video_path: string | null;
    ppl_type: string | null;
    ul_type: string | null;
    muscle_types: string[];
};

export default function ExerciseShow({
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
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Exercises', href: exercises().url },
        { title: exercise.name, href: `/exercises/${exercise.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={exercise.name} />

            <div className="mx-auto max-w-6xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">{exercise.name}</h1>
                    <p className="text-muted-foreground mt-1">{exercise.description}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {exercise.ppl_type && <Badge variant="secondary">{exercise.ppl_type}</Badge>}
                        {exercise.ul_type && <Badge variant="secondary">{exercise.ul_type}</Badge>}
                        {exercise.muscle_types.map((muscle) => (
                            <Badge key={muscle} variant="outline">
                                {muscle}
                            </Badge>
                        ))}
                    </div>
                </div>

                {exercise.video_path && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Reference Video</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <video
                                className="w-full rounded-lg"
                                controls
                                preload="metadata"
                                src={exercise.video_path}
                            />
                        </CardContent>
                    </Card>
                )}

                {exercise.instructions && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{exercise.instructions}</p>
                        </CardContent>
                    </Card>
                )}

                <h2 className="mb-4 text-xl font-semibold">Camera Feedback</h2>
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
