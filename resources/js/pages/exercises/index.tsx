import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exercises', href: '/exercises' },
];

export default function ExercisesIndex({ exercises }: { exercises: Exercise[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="mx-auto max-w-4xl p-4">
                <h1 className="mb-6 text-2xl font-bold">Exercises</h1>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {exercises.map((exercise) => (
                        <Link
                            key={exercise.id}
                            href={`/exercises/${exercise.id}/coach`}
                            className="block transition-opacity hover:opacity-80"
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>{exercise.name}</CardTitle>
                                    <CardDescription>{exercise.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {exercises.length === 0 && (
                    <p className="text-muted-foreground text-center">No exercises found.</p>
                )}
            </div>
        </AppLayout>
    );
}
