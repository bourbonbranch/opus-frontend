import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
    HomeIcon,
    MapPinIcon,
    UsersIcon,
    UserPlusIcon,
    CalendarIcon,
    LayoutGridIcon,
    DollarSignIcon,
    MessageSquareIcon,
    TicketIcon,
    MenuIcon,
    XIcon,
} from 'lucide-react';

export function DashboardLayout() {
    const [directorInfo, setDirectorInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Director',
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Get director info from localStorage
        const firstName = localStorage.getItem('directorFirstName') || 'Director';
        const lastName = localStorage.getItem('directorLastName') || '';
        const email = localStorage.getItem('directorEmail') || '';
        const role = localStorage.getItem('directorRole') || 'Director';

        setDirectorInfo({ firstName, lastName, email, role });
    }, []);

    const getInitials = () => {
        const first = directorInfo.firstName?.[0] || '';
        const last = directorInfo.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'D';
    };

    const getFullName = () => {
        return `${directorInfo.firstName} ${directorInfo.lastName}`.trim() || 'Director';
    };

    const navItems = [
        {
            to: '/director/today',
            icon: HomeIcon,
            label: 'Today',
        },
        {
            to: '/director/rooms',
            icon: MapPinIcon,
            label: 'Rooms',
        },
        {
            to: '/director/roster',
            icon: UsersIcon,
            label: 'Roster',
        },
        {
            to: '/director/ensembles',
            icon: UsersIcon,
            label: 'Ensembles',
        },
        {
            to: '/director/recruiting',
            icon: UserPlusIcon,
            label: 'Recruiting',
        },
        {
            to: '/director/events',
            icon: CalendarIcon,
            label: 'Events',
        },
        {
            to: '/director/calendar',
            icon: CalendarIcon,
            label: 'Calendar',
        },
        {
            to: '/director/seating',
            icon: LayoutGridIcon,
            label: 'Seating',
        },
        {
            to: '/director/fundraising',
            icon: DollarSignIcon,
            label: 'Fundraising',
        },
        {
            to: '/director/messages',
            icon: MessageSquareIcon,
            label: 'Messages',
        },
        {
            to: '/director/tickets',
            icon: TicketIcon,
            label: 'Tickets',
        },
    ];

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 right-4 z-[60] p-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl text-white hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? (
                    <XIcon className="w-6 h-6" />
                ) : (
                    <MenuIcon className="w-6 h-6" />
                )}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 flex flex-col shadow-2xl
                fixed md:relative inset-y-0 left-0 z-50 
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-700">
                    <div className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        <h1 className="text-2xl font-bold">Opus</h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Director Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[44px] ${isActive
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-6 h-6 flex-shrink-0" />
                            <span className="font-medium text-base">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-sm font-semibold text-white">{getInitials()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-medium text-white truncate">{getFullName()}</p>
                            <p className="text-sm text-gray-400 capitalize">{directorInfo.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
