import { CameraIcon, CameraOffIcon, VideoIcon } from 'lucide-react';
import { useRef } from 'react';
import PoseOverlay from '@/components/coaching/pose-overlay';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { JointDeviation, Point3D } from '@/types';

export const VIDEO_WIDTH = 640;

export default function WebcamView({
    videoRef,
    canvasRef,
    gifCanvasRef,
    landmarks,
    deviations,
    isLoading,
    isRunning,
    isVideoFile,
    isGif,
    mediaAspectRatio,
    error,
    onStart,
    onStartWithFile,
    onStop,
}: {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    gifCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    landmarks: Point3D[] | null;
    deviations: JointDeviation[];
    isLoading: boolean;
    isRunning: boolean;
    isVideoFile: boolean;
    isGif: boolean;
    mediaAspectRatio: number;
    error: string | null;
    onStart: () => void;
    onStartWithFile: (file: File) => void;
    onStop: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onStartWithFile(file);
        }
        e.target.value = '';
    };

    return (
        <div className="flex flex-col gap-4">
            <div
                className="bg-muted relative mx-auto w-full max-w-[min(20rem,var(--media-max-w))] overflow-hidden rounded-lg sm:max-w-(--media-max-w)"
                style={
                    {
                        aspectRatio: mediaAspectRatio,
                        '--media-max-w': `calc(70vh * ${mediaAspectRatio})`,
                    } as React.CSSProperties
                }
            >
                <video
                    ref={videoRef}
                    className={isGif ? 'hidden' : 'h-full w-full object-contain'}
                    playsInline
                    muted
                    style={isVideoFile ? undefined : { transform: 'scaleX(-1)' }}
                />
                <canvas ref={gifCanvasRef} className={isGif ? 'h-full w-full object-contain' : 'hidden'} />

                <PoseOverlay
                    landmarks={landmarks}
                    deviations={deviations}
                    width={VIDEO_WIDTH}
                    height={Math.round(VIDEO_WIDTH / mediaAspectRatio)}
                    canvasRef={canvasRef}
                    isMirrored={!isVideoFile}
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

            <input ref={fileInputRef} type="file" accept="video/*,image/gif" className="hidden" onChange={handleFileChange} />

            <div className="flex gap-2">
                <Button
                    className="flex-1"
                    onClick={isRunning ? onStop : onStart}
                    disabled={isLoading}
                    variant={isRunning && !isVideoFile ? 'destructive' : 'default'}
                >
                    {isRunning && !isVideoFile ? (
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

                <Button
                    className="flex-1"
                    onClick={isRunning && isVideoFile ? onStop : () => fileInputRef.current?.click()}
                    disabled={isLoading}
                    variant={isRunning && isVideoFile ? 'destructive' : 'outline'}
                >
                    {isRunning && isVideoFile ? (
                        <>
                            <CameraOffIcon />
                            Stop Video
                        </>
                    ) : (
                        <>
                            <VideoIcon />
                            Load Video / GIF
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
