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
 *       'tempo' => [ // optional, enables rep-based feedback
 *           'eccentric' => ['min' => float, 'max' => float], // seconds
 *           'concentric' => ['min' => float, 'max' => float],
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
        'tempo' => [
            'eccentric' => ['min' => 1.5, 'max' => 3.0],
            'concentric' => ['min' => 0.8, 'max' => 2.0],
        ],
    ],

];
