export type JointAngles = Record<string, number>;

export type AngleRange = {
    min: number;
    ideal: number;
    max: number;
};

export type PhaseReference = Record<string, AngleRange>;

export type ExerciseReference = {
    phases: Record<string, PhaseReference>;
};

export type ExercisePhase = {
    name: string;
    angles: JointAngles;
};

export type JointDeviation = {
    joint: string;
    actual: number;
    ideal: number;
    deviation: number;
};

export type JointCorrection = {
    joint: string;
    correction: string;
};

export type CoachingFeedback = {
    overallFeedback: string;
    jointCorrections: JointCorrection[];
    encouragement: string;
};

export type PoseInputData = {
    jointAngles: JointAngles;
    deviations: JointDeviation[];
    currentPhase: string;
    repCount: number;
};

export type Point3D = {
    x: number;
    y: number;
    z: number;
    visibility?: number;
};
