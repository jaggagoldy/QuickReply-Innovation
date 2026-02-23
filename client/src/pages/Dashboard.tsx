import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className={`${color} p-3 rounded-xl bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { data: ideas, isLoading } = useQuery({
        queryKey: ['ideas'],
        queryFn: async () => {
            const response = await api.get('/ideas');
            return response.data;
        }
    });

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div></div>;

    const stats = [
        { title: 'Total Ideas', value: ideas?.length || 0, icon: TrendingUp, color: 'bg-primary-500' },
        { title: 'Under Review', value: ideas?.filter((i: any) => i.status === 'UNDER_REVIEW').length || 0, icon: Clock, color: 'bg-amber-500' },
        { title: 'Approved', value: ideas?.filter((i: any) => i.status === 'APPROVED').length || 0, icon: CheckCircle2, color: 'bg-emerald-500' },
        { title: 'Recent Comments', value: ideas?.reduce((acc: number, i: any) => acc + (i._count?.comments || 0), 0), icon: MessageSquare, color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Innovation Dashboard</h1>
                    <p className="text-slate-400 mt-1">Track and manage product ideas from the team.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition-colors">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                    <Link to="/submit" className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                        New Idea
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Latest Submissions</h2>
                    <button className="text-primary-400 text-sm font-medium hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Idea Details</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Priority</th>
                                <th className="px-6 py-4 font-medium">Submitted</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {ideas?.map((idea: any) => (
                                <tr key={idea.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium group-hover:text-primary-400 transition-colors">{idea.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">by {idea.owner.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 text-xs">{idea.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className={`h-2 w-2 rounded-full ${idea.status === 'APPROVED' ? 'bg-emerald-500' :
                                                idea.status === 'REJECTED' ? 'bg-red-500' :
                                                    idea.status === 'SUBMITTED' ? 'bg-blue-500' : 'bg-amber-500'
                                                }`}></div>
                                            <span className="text-sm font-medium">{idea.status.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${idea.priority === 'HIGH' ? 'text-red-400 bg-red-400/10' :
                                            idea.priority === 'MEDIUM' ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'
                                            }`}>
                                            {idea.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/idea/${idea.id}`} className="p-2 inline-block hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <ArrowUpRight className="h-5 w-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {ideas?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No ideas found. Be the first to innovate!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
