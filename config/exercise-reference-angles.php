<?php

declare(strict_types=1);

/**
 * Reference joint angles for AI coaching pose analysis.
 *
 * Each exercise defines phases with expected joint angles (in degrees)
 * and an acceptable tolerance range. MediaPipe landmarks are used
 * to compute angles on the client side, then compared against these
 * reference values for form feedback via Gemini.
 *
 * Structure:
 *   'exercise_key' => [
 *       'phases' => [
 *           'phase_name' => [
 *               'joint_name' => ['min' => float, 'ideal' => float, 'max' => float],
 *           ],
 *       ],
 *   ]
 */
return [

    'squat' => [
        'phases' => [
            'standing' => [
                'knee' => ['min' => 170, 'ideal' => 180, 'max' => 180],
                'hip' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
            'bottom' => [
                'knee' => ['min' => 70, 'ideal' => 90, 'max' => 110],
                'hip' => ['min' => 70, 'ideal' => 90, 'max' => 110],
                'ankle' => ['min' => 60, 'ideal' => 75, 'max' => 90],
            ],
        ],
    ],

    'bicep_curl' => [
        'phases' => [
            'extended' => [
                'elbow' => ['min' => 160, 'ideal' => 170, 'max' => 180],
            ],
            'contracted' => [
                'elbow' => ['min' => 30, 'ideal' => 40, 'max' => 60],
                'shoulder' => ['min' => 0, 'ideal' => 5, 'max' => 15],
            ],
        ],
    ],

    'push_up' => [
        'phases' => [
            'top' => [
                'elbow' => ['min' => 165, 'ideal' => 175, 'max' => 180],
                'shoulder' => ['min' => 75, 'ideal' => 85, 'max' => 95],
                'hip' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
            'bottom' => [
                'elbow' => ['min' => 70, 'ideal' => 90, 'max' => 110],
                'shoulder' => ['min' => 50, 'ideal' => 70, 'max' => 85],
                'hip' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
        ],
    ],

    'overhead_press' => [
        'phases' => [
            'start' => [
                'elbow' => ['min' => 80, 'ideal' => 90, 'max' => 100],
                'shoulder' => ['min' => 80, 'ideal' => 90, 'max' => 100],
            ],
            'lockout' => [
                'elbow' => ['min' => 165, 'ideal' => 175, 'max' => 180],
                'shoulder' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
        ],
    ],

    'deadlift' => [
        'phases' => [
            'setup' => [
                'knee' => ['min' => 120, 'ideal' => 135, 'max' => 150],
                'hip' => ['min' => 60, 'ideal' => 75, 'max' => 90],
            ],
            'lockout' => [
                'knee' => ['min' => 170, 'ideal' => 180, 'max' => 180],
                'hip' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
        ],
    ],

    'lunge' => [
        'phases' => [
            'standing' => [
                'knee' => ['min' => 170, 'ideal' => 180, 'max' => 180],
                'hip' => ['min' => 170, 'ideal' => 180, 'max' => 180],
            ],
            'bottom' => [
                'front_knee' => ['min' => 80, 'ideal' => 90, 'max' => 100],
                'back_knee' => ['min' => 80, 'ideal' => 90, 'max' => 100],
                'hip' => ['min' => 100, 'ideal' => 120, 'max' => 140],
            ],
        ],
    ],

];
