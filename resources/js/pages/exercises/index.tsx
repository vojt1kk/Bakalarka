import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ExerciseCoachController from '@/actions/App/Http/Controllers/ExerciseCoachController';
import { dashboard, exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Exercise = {
    id: number;
    name: string;
    description: string;
    instructions: string | null;
    ppl_type: string | null;
    ul_type: string | null;
    muscle_types: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Exercises', href: exercises().url },
];

export default function ExercisesIndex({ exercises: exerciseList }: { exercises: Exercise[] }) {
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="mx-auto max-w-4xl p-4">
                <h1 className="mb-6 text-2xl font-bold">Exercises</h1>

                <div className="flex flex-col gap-3">
                    {exerciseList.map((exercise) => (
                        <Collapsible
                            key={exercise.id}
                            open={openId === exercise.id}
                            onOpenChange={(isOpen) => setOpenId(isOpen ? exercise.id : null)}
                        >
                            <Card>
                                <CollapsibleTrigger asChild>
                                    <button className="w-full cursor-pointer text-left">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>{exercise.name}</CardTitle>
                                                <svg
                                                    className={`text-muted-foreground size-5 shrink-0 transition-transform duration-200 ${openId === exercise.id ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <CardDescription>{exercise.description}</CardDescription>
                                        </CardHeader>
                                    </button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="flex flex-col gap-4 border-t pt-4">
                                        {exercise.instructions && (
                                            <div>
                                                <h3 className="mb-1 text-sm font-medium">Instructions</h3>
                                                <p className="text-muted-foreground text-sm whitespace-pre-line">
                                                    {exercise.instructions}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-1.5">
                                            {exercise.ppl_type && (
                                                <Badge variant="secondary">{exercise.ppl_type}</Badge>
                                            )}
                                            {exercise.ul_type && (
                                                <Badge variant="secondary">{exercise.ul_type}</Badge>
                                            )}
                                            {exercise.muscle_types.map((muscle) => (
                                                <Badge key={muscle} variant="outline">
                                                    {muscle}
                                                </Badge>
                                            ))}
                                        </div>

                                        <Button asChild className="self-start">
                                            <Link href={ExerciseCoachController.url(exercise.id)}>
                                                Start with Camera
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </div>

                {exerciseList.length === 0 && (
                    <p className="text-muted-foreground text-center">No exercises found.</p>
                )}
            </div>
        </AppLayout>
    );
}
