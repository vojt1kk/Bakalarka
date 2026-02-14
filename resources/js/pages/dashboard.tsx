import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { dashboard, exercises } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ exerciseCount }: { exerciseCount: number }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-primary/10 to-primary/5 p-8 dark:border-sidebar-border dark:from-primary/20 dark:to-primary/10">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight">Welcome to Fitrack</h1>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                        Your AI-powered fitness coach. Pick an exercise and get real-time camera feedback on your form.
                    </p>
                    <Button asChild size="lg">
                        <Link href={exercises().url}>Start Training</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-medium">Available Exercises</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{exerciseCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-medium">Last Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-lg">No activity yet</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-muted-foreground text-sm font-medium">Total Workouts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
