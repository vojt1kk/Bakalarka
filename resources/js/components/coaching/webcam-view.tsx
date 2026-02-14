import { CameraIcon, CameraOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import PoseOverlay from '@/components/coaching/pose-overlay';
import type { JointDeviation, Point3D } from '@/types';

export const VIDEO_WIDTH = 640;
export const VIDEO_HEIGHT = 480;

export default function WebcamView({
    videoRef,
    canvasRef,
    landmarks,
    deviations,
    isLoading,
    isRunning,
    error,
    onStart,
    onStop,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    landmarks: Point3D[] | null;
    deviations: JointDeviation[];
    isLoading: boolean;
    isRunning: boolean;
    error: string | null;
    onStart: () => void;
    onStop: () => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div
                className="bg-muted relative overflow-hidden rounded-lg"
                style={{ aspectRatio: `${VIDEO_WIDTH}/${VIDEO_HEIGHT}` }}
            >
                <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                />

                <PoseOverlay
                    landmarks={landmarks}
                    deviations={deviations}
                    width={VIDEO_WIDTH}
                    height={VIDEO_HEIGHT}
                    canvasRef={canvasRef}
                />

                {!isRunning && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Camera is off</p>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex items-center gap-2 text-white">
                            <Spinner className="size-5" />
                            <span className="text-sm">Loading pose model...</span>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
                onClick={isRunning ? onStop : onStart}
                disabled={isLoading}
                variant={isRunning ? 'destructive' : 'default'}
            >
                {isRunning ? (
                    <>
                        <CameraOffIcon />
                        Stop Camera
                    </>
                ) : (
                    <>
                        <CameraIcon />
                        Start Camera
                    </>
                )}
            </Button>
        </div>
    );
}
