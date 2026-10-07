import { Head, Link } from '@inertiajs/react';
import { Dumbbell, Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import ExerciseShowController from '@/actions/App/Http/Controllers/ExerciseShowController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { exercises } from '@/routes';
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
    { title: 'Exercises', href: exercises().url },
];

const FILTERS = ['All', 'Push', 'Pull', 'Legs'] as const;

export default function ExercisesIndex({ exercises: exerciseList }: { exercises: Exercise[] }) {
    const [activeFilter, setActiveFilter] = useState<string>('All');

    const filteredExercises =
        activeFilter === 'All' ? exerciseList : exerciseList.filter((e) => e.ppl_type === activeFilter);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exercises" />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Exercises</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse and select an exercise to start training with AI feedback.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit items-center gap-1 overflow-x-auto rounded-full bg-muted p-1">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                                    activeFilter === filter
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        <span>
                            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Exercise Grid */}
                {filteredExercises.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredExercises.map((exercise) => (
                            <Link
                                key={exercise.id}
                                href={ExerciseShowController.url(exercise.id)}
                                className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <Card className="h-full border-border/60 transition-colors group-hover:border-primary/40 group-hover:bg-card/80">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                                            {exercise.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                                            {[exercise.ppl_type, exercise.ul_type, exercise.muscle_types.join(', ')]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                            <span>View exercise</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <Dumbbell className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-lg font-semibold text-foreground">No exercises found</h3>
                                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                                    There are no exercises matching your current filter. Try a different category.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setActiveFilter('All')}>
                                Clear filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
