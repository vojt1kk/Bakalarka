import { Link } from '@inertiajs/react';
import { CircleUser, Dumbbell, LayoutGrid, Settings } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard, exercises } from '@/routes';
import { edit } from '@/routes/profile';

const tabs = [
    {
        label: 'Home',
        href: dashboard(),
        icon: LayoutGrid,
        matchPrefix: '/dashboard',
    },
    {
        label: 'Exercises',
        href: exercises(),
        icon: Dumbbell,
        matchPrefix: '/exercises',
    },
    {
        label: 'Settings',
        href: edit(),
        icon: Settings,
        matchPrefix: '/settings',
    },
    {
        label: 'Profile',
        href: edit(),
        icon: CircleUser,
        matchPrefix: '/settings/profile',
    },
] as const;

export function BottomTabBar() {
    const { currentUrl } = useCurrentUrl();

    const isActive = (matchPrefix: string) =>
        currentUrl === matchPrefix || currentUrl.startsWith(matchPrefix + '/');

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-stretch justify-around">
                {tabs.map((tab) => {
                    const active = isActive(tab.matchPrefix);
                    return (
                        <Link
                            key={tab.label}
                            href={tab.href}
                            prefetch
                            className={cn(
                                'flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <tab.icon
                                className={cn(
                                    'h-5 w-5',
                                    active && 'text-primary',
                                )}
                            />
                            <span className="font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
