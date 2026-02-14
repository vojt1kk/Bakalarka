import type { JointAngles, JointDeviation, PhaseReference, Point3D } from '@/types/coaching';

/**
 * MediaPipe Pose landmark indices.
 * @see https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model
 */
const Landmark = {
    LeftShoulder: 11,
    RightShoulder: 12,
    LeftElbow: 13,
    RightElbow: 14,
    LeftWrist: 15,
    RightWrist: 16,
    LeftHip: 23,
    RightHip: 24,
    LeftKnee: 25,
    RightKnee: 26,
    LeftAnkle: 27,
    RightAnkle: 28,
} as const;

/**
 * Calculate the angle (in degrees) at point B formed by segments BA and BC.
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
    const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

    const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
    const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
    const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

    if (magBA === 0 || magBC === 0) {
        return 0;
    }

    const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));

    return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Joint angle definitions: each joint maps to a triplet of landmark indices [A, B, C]
 * where the angle is measured at B.
 */
const jointDefinitions: Record<string, [number, number, number]> = {
    left_shoulder: [Landmark.LeftElbow, Landmark.LeftShoulder, Landmark.LeftHip],
    right_shoulder: [Landmark.RightElbow, Landmark.RightShoulder, Landmark.RightHip],
    left_elbow: [Landmark.LeftShoulder, Landmark.LeftElbow, Landmark.LeftWrist],
    right_elbow: [Landmark.RightShoulder, Landmark.RightElbow, Landmark.RightWrist],
    left_hip: [Landmark.LeftShoulder, Landmark.LeftHip, Landmark.LeftKnee],
    right_hip: [Landmark.RightShoulder, Landmark.RightHip, Landmark.RightKnee],
    left_knee: [Landmark.LeftHip, Landmark.LeftKnee, Landmark.LeftAnkle],
    right_knee: [Landmark.RightHip, Landmark.RightKnee, Landmark.RightAnkle],
    left_ankle: [Landmark.LeftKnee, Landmark.LeftAnkle, Landmark.LeftHip],
    right_ankle: [Landmark.RightKnee, Landmark.RightAnkle, Landmark.RightHip],
};

/**
 * Maps bilateral joints to the reference key used in exercise-reference-angles config.
 * The backend config uses generic names (e.g. "knee"), so we average left/right.
 */
const referenceKeyMap: Record<string, [string, string]> = {
    shoulder: ['left_shoulder', 'right_shoulder'],
    elbow: ['left_elbow', 'right_elbow'],
    hip: ['left_hip', 'right_hip'],
    knee: ['left_knee', 'right_knee'],
    ankle: ['left_ankle', 'right_ankle'],
};

/**
 * Extract named joint angles from 33 MediaPipe pose landmarks.
 * Returns both individual (left/right) and averaged angles for reference matching.
 */
export function extractJointAngles(landmarks: Point3D[]): JointAngles {
    const angles: JointAngles = {};

    for (const [joint, [a, b, c]] of Object.entries(jointDefinitions)) {
        if (landmarks[a] && landmarks[b] && landmarks[c]) {
            angles[joint] = Math.round(calculateAngle(landmarks[a], landmarks[b], landmarks[c]) * 10) / 10;
        }
    }

    for (const [refKey, [left, right]] of Object.entries(referenceKeyMap)) {
        if (angles[left] !== undefined && angles[right] !== undefined) {
            angles[refKey] = Math.round(((angles[left] + angles[right]) / 2) * 10) / 10;
        }
    }

    return angles;
}

/**
 * Compare measured joint angles against reference angles for a given phase.
 * Returns deviations for joints that fall outside the acceptable range.
 */
export function detectDeviations(angles: JointAngles, reference: PhaseReference): JointDeviation[] {
    const deviations: JointDeviation[] = [];

    for (const [joint, range] of Object.entries(reference)) {
        const actual = angles[joint];

        if (actual === undefined) {
            continue;
        }

        if (actual < range.min || actual > range.max) {
            deviations.push({
                joint,
                actual,
                ideal: range.ideal,
                deviation: Math.round((actual - range.ideal) * 10) / 10,
            });
        }
    }

    return deviations;
}
