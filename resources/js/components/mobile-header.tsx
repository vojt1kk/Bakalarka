import { Link, usePage } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLogoIcon from '@/components/app-logo-icon';
import type { Auth } from '@/types';
import { dashboard } from '@/routes';

export function MobileHeader() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg">
            <Link
                href={dashboard()}
                prefetch
                className="flex items-center gap-2"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                </div>
                <span className="text-sm font-semibold">Fitrack</span>
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="focus-visible:ring-ring rounded-full focus-visible:outline-none focus-visible:ring-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={auth.user.avatar}
                                alt={auth.user.name}
                            />
                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
