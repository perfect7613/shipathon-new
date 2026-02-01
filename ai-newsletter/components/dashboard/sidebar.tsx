'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    visibleGenres: { id: string; name: string; color: string }[];
}

export function Sidebar({ visibleGenres }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex-shrink-0 overflow-y-auto hidden md:block h-full">
            <div className="p-4 space-y-8">

                {/* Platform Section */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Platform
                    </h3>
                    <nav className="space-y-1">
                        <NavLink
                            href="/dashboard"
                            active={pathname === '/dashboard'}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                            label="Home"
                        />
                        <NavLink
                            href="/dashboard/articles"
                            active={pathname.startsWith('/dashboard/articles')}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />}
                            label="Articles"
                        />
                        <NavLink
                            href="/dashboard/generate"
                            active={pathname === '/dashboard/generate'}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />} // Use Lightning icon for Create/Generate
                            label="Generate"
                        />
                    </nav>
                </div>

                {/* Topics Section */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Your Topics
                    </h3>
                    <nav className="space-y-1">
                        {visibleGenres.map((genre) => (
                            <Link
                                key={genre.id}
                                href={`/dashboard/genres/${genre.id}`}
                                className={`
                  group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${pathname === `/dashboard/genres/${genre.id}`
                                        ? 'bg-gray-800 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }
                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${genre.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                {genre.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Settings Section */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Account
                    </h3>
                    <nav className="space-y-1">
                        <NavLink
                            href="/dashboard/settings"
                            active={pathname === '/dashboard/settings'}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
                            label="Settings"
                        />
                    </nav>
                </div>

            </div>
        </aside>
    );
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
      `}
        >
            <svg
                className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                {icon}
            </svg>
            {label}
        </Link>
    );
}
