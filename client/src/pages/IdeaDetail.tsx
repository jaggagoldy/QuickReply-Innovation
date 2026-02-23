import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    MessageSquare,
    History,
    ShieldCheck,
    ChevronRight,
    TrendingUp,
    User,
    Calendar,
    AlertTriangle,
    Lightbulb,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const IdeaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('details');

    const { data: idea, isLoading } = useQuery({
        queryKey: ['idea', id],
        queryFn: async () => {
            const response = await api.get(`/ideas/${id}`);
            return response.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (update: { status: string, comment: string }) =>
            api.patch(`/ideas/${id}/status`, update),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['idea', id] });
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
        }
    });
    const deleteIdeaMutation = useMutation({
        mutationFn: () => api.delete(`/ideas/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            navigate('/dashboard');
        }
    });
    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div></div>;
    if (!idea) return <div>Idea not found</div>;

    const isAdmin = ['ADMIN', 'PM', 'REVIEWER', 'SUPER_ADMIN', 'MANAGEMENT'].includes(user?.role || '');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
            </button>

            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-primary-400 font-semibold border border-primary-400/20">{idea.category}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${idea.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            idea.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {idea.status.replace('_', ' ')}
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold">{idea.title}</h1>
                    <div className="flex items-center space-x-6 text-slate-400 text-sm py-2">
                        <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{idea.owner.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(idea.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex space-x-3">
                        {idea.status !== 'REJECTED' && (
                            <button
                                onClick={() => {
                                    const reason = window.prompt('Reason for rejection:');
                                    if (reason !== null) updateStatusMutation.mutate({ status: 'REJECTED', comment: reason });
                                }}
                                className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium"
                            >
                                Reject
                            </button>
                        )}
                        {idea.status === 'SUBMITTED' && (
                            <button
                                onClick={() => {
                                    const reason = window.prompt('Shortlist comment (optional):', 'Moving to review phase');
                                    if (reason !== null) updateStatusMutation.mutate({ status: 'UNDER_REVIEW', comment: reason });
                                }}
                                className="px-6 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all font-medium"
                            >
                                Screen & Shortlist
                            </button>
                        )}
                        {idea.status === 'UNDER_REVIEW' && (
                            <button
                                onClick={() => {
                                    const reason = window.prompt('Approval comment (optional):', 'Idea approved for implementation');
                                    if (reason !== null) updateStatusMutation.mutate({ status: 'APPROVED', comment: reason });
                                }}
                                className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all font-medium"
                            >
                                Approve
                            </button>
                        )}
                        {user?.role === 'SUPER_ADMIN' && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this idea? This cannot be undone.')) {
                                        deleteIdeaMutation.mutate();
                                    }
                                }}
                                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all shadow-lg"
                                title="Delete Idea"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-slate-800">
                {[
                    { id: 'details', label: 'Idea Details', icon: Lightbulb },
                    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
                    { id: 'history', label: 'Status Timeline', icon: History },
                    { id: 'evaluation', label: 'Product Evaluation', icon: ShieldCheck, restricted: !isAdmin },
                ].filter(t => !t.restricted).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 pb-4 text-sm font-medium transition-all relative ${activeTab === tab.id ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'details' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                                    <span>Problem Statement</span>
                                </h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{idea.problemStatement}</p>

                                {idea.currentWorkaround && (
                                    <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border-l-4 border-amber-500/50">
                                        <h4 className="text-sm font-bold text-amber-400 mb-1 uppercase tracking-wider">Current Workaround</h4>
                                        <p className="text-slate-400 text-sm italic">{idea.currentWorkaround}</p>
                                    </div>
                                )}
                            </section>

                            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                    <span>Proposed Solution</span>
                                </h3>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{idea.proposedSolution}</p>

                                <div className="mt-8">
                                    <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Example Scenario</h4>
                                    <p className="p-4 rounded-xl bg-slate-800/30 text-slate-300 text-sm border border-slate-800">{idea.exampleScenario}</p>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'discussion' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 animate-in fade-in duration-300 min-h-[400px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Comments</h3>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">{idea.comments.length} items</span>
                            </div>

                            <div className="space-y-6">
                                {idea.comments.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No comments yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    idea.comments.map((comment: any) => (
                                        <div key={comment.id} className="flex space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold shrink-0">
                                                {comment.author.name[0]}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-sm">{comment.author.name}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">{format(new Date(comment.createdAt), 'MMM dd | HH:mm')}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm bg-slate-800/40 p-4 rounded-2xl rounded-tl-none border border-slate-800/50">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <textarea
                                    placeholder="Add a comment or tag someone with @..."
                                    className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-primary-500/30 outline-none min-h-[100px]"
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {idea.statusHistory.map((history: any, i: number) => (
                                <div key={history.id} className="relative pl-8">
                                    {i !== idea.statusHistory.length - 1 && (
                                        <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-slate-800"></div>
                                    )}
                                    <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-slate-950 px-0.5 ${i === 0 ? 'bg-primary-400' : 'bg-slate-700'
                                        }`}></div>
                                    <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white flex items-center space-x-2">
                                                <span>Status changed to</span>
                                                <span className="text-primary-400">{history.status.replace('_', ' ')}</span>
                                                <span className="text-slate-500 font-normal ml-2">by {history.changedByUser?.name || 'Unknown'}</span>
                                            </h4>
                                            <span className="text-xs text-slate-500">{format(new Date(history.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                        {history.comment && (
                                            <p className="text-slate-400 text-sm mt-2 italic">“{history.comment}”</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'evaluation' && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 animate-in fade-in duration-300">
                            <div className="flex items-center space-x-3 mb-8">
                                <ShieldCheck className="h-6 w-6 text-primary-400" />
                                <h3 className="text-xl font-bold">Expert Evaluation</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Business Impact', key: 'businessImpact' },
                                        { label: 'Customer Value', key: 'customerValue' },
                                        { label: 'Technical Effort', key: 'techEffort', invert: true },
                                        { label: 'Revenue Potential', key: 'revenuePotential' },
                                    ].map(field => (
                                        <div key={field.key} className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium text-slate-300">{field.label}</label>
                                                <span className="text-primary-400 font-bold">4 / 5</span>
                                            </div>
                                            <input type="range" min="1" max="5" defaultValue="4" className="w-full accent-primary-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/20 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Calculated Innovation Score</h4>
                                        <p className="text-sm text-slate-400">Formula: (Impact + Value + Revenue) - Effort</p>
                                    </div>
                                    <div className="text-4xl font-black text-primary-400 tracking-tighter">
                                        12.5
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-primary-500/20">
                                        Save Evaluation
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Metadata</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">ID</span>
                                <span className="font-mono text-xs text-slate-300">{idea.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Priority</span>
                                <span className={`font-bold ${idea.priority === 'HIGH' ? 'text-red-400' :
                                    idea.priority === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                                    }`}>{idea.priority}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Department</span>
                                <span className="text-slate-300">{idea.owner.department || 'General'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <TrendingUp className="h-20 w-20 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest relative z-10">Target Impact</h3>
                        <div className="space-y-2 relative z-10">
                            {JSON.parse(idea.expectedImpact).map((impact: string) => (
                                <div key={impact} className="flex items-center space-x-2 text-sm text-indigo-300 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                                    <ChevronRight className="h-4 w-4" />
                                    <span>{impact}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Beneficiaries</h3>
                        <div className="flex flex-wrap gap-2">
                            {JSON.parse(idea.beneficiaries).map((b: string) => (
                                <span key={b} className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </section>

                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex space-x-4">
                        <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                            Internal project. Do not share idea details with external merchants until release.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdeaDetail;
