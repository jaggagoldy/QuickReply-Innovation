import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Lightbulb, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Lightbulb className="h-8 w-8 text-primary-400" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
                                QuickReply Innovation
                            </span>
                        </Link>

                        <div className="flex items-center space-x-6">
                            <Link to="/dashboard" className="flex items-center space-x-1 hover:text-primary-400 transition-colors">
                                <LayoutDashboard className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/submit" className="flex items-center space-x-1 hover:text-primary-400 transition-colors">
                                <PlusCircle className="h-5 w-5" />
                                <span>Submit Idea</span>
                            </Link>
                            {user?.role === 'SUPER_ADMIN' && (
                                <Link to="/users" className="flex items-center space-x-1 hover:text-primary-400 transition-colors">
                                    <Settings className="h-5 w-5" />
                                    <span>Users</span>
                                </Link>
                            )}

                            <div className="h-6 w-px bg-slate-800"></div>

                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-slate-400 lowercase">{user?.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
