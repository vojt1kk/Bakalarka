import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ExerciseShowController from '@/actions/App/Http/Controllers/ExerciseShowController';
import { dashboard, exercises } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Exercise = {
    id: number;
    name: string;
    description: string;
    ppl_type: string | null;
    ul_type: string | null;
    muscle_types: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Exercises', href: exercises().url },
];

export default function ExercisesIndex({ exercises: exerciseList }: { exercises: Exercise[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="mx-auto max-w-4xl p-4">
                <h1 className="mb-6 text-2xl font-bold">Exercises</h1>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exerciseList.map((exercise) => (
                        <Link key={exercise.id} href={ExerciseShowController.url(exercise.id)} className="block">
                            <Card className="h-full transition-shadow hover:shadow-md">
                                <CardHeader>
                                    <div className="mb-2 flex items-center gap-3">
                                        <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                            {exercise.name.charAt(0).toUpperCase()}
                                        </div>
                                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                                    </div>
                                    <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                {exerciseList.length === 0 && (
                    <p className="text-muted-foreground text-center">No exercises found.</p>
                )}
            </div>
        </AppLayout>
    );
}
