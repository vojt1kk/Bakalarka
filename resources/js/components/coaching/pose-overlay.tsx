import { useEffect, useRef } from 'react';
import { PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import type { Point3D, JointDeviation } from '@/types';

const LANDMARK_STYLE = { color: '#00FF00', lineWidth: 2, radius: 4 };
const CONNECTOR_STYLE = { color: '#00FF00', lineWidth: 2 };
const DEVIATION_COLOR = '#FF4444';
const WARNING_COLOR = '#FFAA00';

export default function PoseOverlay({
    landmarks,
    deviations,
    width,
    height,
    canvasRef,
}: {
    landmarks: Point3D[] | null;
    deviations: JointDeviation[];
    width: number;
    height: number;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
    const drawingUtilsRef = useRef<DrawingUtils | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
        }
    }, [canvasRef, width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const drawingUtils = drawingUtilsRef.current;

        if (!canvas || !ctx || !drawingUtils) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!landmarks) return;

        const deviatedJoints = new Set(deviations.map((d) => d.joint));

        const normalizedLandmarks = landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility ?? 0,
        }));

        drawingUtils.drawConnectors(normalizedLandmarks, PoseLandmarker.POSE_CONNECTIONS, CONNECTOR_STYLE);

        drawingUtils.drawLandmarks(normalizedLandmarks, LANDMARK_STYLE);

        // Highlight deviated joints with colored circles
        if (deviatedJoints.size > 0) {
            const jointLandmarkMap: Record<string, number[]> = {
                shoulder: [11, 12],
                elbow: [13, 14],
                hip: [23, 24],
                knee: [25, 26],
                ankle: [27, 28],
            };

            for (const deviation of deviations) {
                const indices = jointLandmarkMap[deviation.joint];
                if (!indices) continue;

                const severity = Math.abs(deviation.deviation);
                const color = severity > 20 ? DEVIATION_COLOR : WARNING_COLOR;

                for (const idx of indices) {
                    const lm = landmarks[idx];
                    if (!lm) continue;

                    ctx.beginPath();
                    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 8, 0, 2 * Math.PI);
                    ctx.fillStyle = color + '80';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }, [landmarks, deviations, canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            width={width}
            height={height}
        />
    );
}
