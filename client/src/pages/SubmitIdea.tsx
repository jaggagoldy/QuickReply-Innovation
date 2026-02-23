import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import {
    Send,
    AlertCircle,
    CheckCircle,
    ShieldCheck,
    Zap,
    Users
} from 'lucide-react';


const SubmitIdea = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Product Feature',
        priority: 'MEDIUM',
        problemStatement: '',
        currentWorkaround: '',
        proposedSolution: '',
        exampleScenario: '',
        beneficiaries: ['Customers'],
        expectedImpact: ['CSAT Improvement'],
    });

    const mutation = useMutation({
        mutationFn: (newIdea: any) => api.post('/ideas', newIdea),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
            navigate('/dashboard');
        }
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold">Submit Your Innovation</h1>
                <p className="text-slate-400 mt-2">Help us shape the future of QuickReply with your ideas.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* Core Info */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center space-x-2 text-primary-400 mb-2">
                        <ShieldCheck className="h-5 w-5" />
                        <h2 className="text-xl font-semibold text-white">The Brief</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-slate-300">Idea Title</label>
                            <input
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g. Automated Ticket Tagging based on Sentiment"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            >
                                <option>Product Feature</option>
                                <option>Automation</option>
                                <option>Internal Tool</option>
                                <option>Merchant Dashboard</option>
                                <option>AI/ML Enhancement</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl">
                        <div className="flex items-center space-x-2 text-amber-400 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <h2 className="text-xl font-semibold text-white">Problem & Baseline</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">What is the pain point?</label>
                            <textarea
                                name="problemStatement"
                                required
                                rows={4}
                                value={formData.problemStatement}
                                onChange={handleChange}
                                placeholder="Describe the current issue merchants or teams face..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Current Workaround (if any)</label>
                            <textarea
                                name="currentWorkaround"
                                rows={3}
                                value={formData.currentWorkaround}
                                onChange={handleChange}
                                placeholder="How are we solving it today?"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            ></textarea>
                        </div>
                    </section>

                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl">
                        <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                            <CheckCircle className="h-5 w-5" />
                            <h2 className="text-xl font-semibold text-white">Proposed Solution</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">How would you solve it?</label>
                            <textarea
                                name="proposedSolution"
                                required
                                rows={4}
                                value={formData.proposedSolution}
                                onChange={handleChange}
                                placeholder="Explain your vision for the solution..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Example Scenario</label>
                            <textarea
                                name="exampleScenario"
                                required
                                rows={3}
                                value={formData.exampleScenario}
                                onChange={handleChange}
                                placeholder="Step-by-step logic of how it works..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
                            ></textarea>
                        </div>
                    </section>
                </div>

                {/* Impact & Beneficiaries */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-indigo-400">
                                <Users className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">Who benefits?</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {['Customers', 'Support Team', 'Product Team', 'Sales', 'Developers'].map(item => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => {
                                            const exists = formData.beneficiaries.includes(item);
                                            setFormData(prev => ({
                                                ...prev,
                                                beneficiaries: exists
                                                    ? prev.beneficiaries.filter(i => i !== item)
                                                    : [...prev.beneficiaries, item]
                                            }));
                                        }}
                                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${formData.beneficiaries.includes(item)
                                            ? 'bg-primary-600 border-primary-500 text-white'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-pink-400">
                                <Zap className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">Expected Impact</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {['CSAT Improvement', 'Revenue Growth', 'Cost Reduction', 'Efficiency', 'Speed'].map(item => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => {
                                            const exists = formData.expectedImpact.includes(item);
                                            setFormData(prev => ({
                                                ...prev,
                                                expectedImpact: exists
                                                    ? prev.expectedImpact.filter(i => i !== item)
                                                    : [...prev.expectedImpact, item]
                                            }));
                                        }}
                                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${formData.expectedImpact.includes(item)
                                            ? 'bg-primary-600 border-primary-500 text-white'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white px-10 py-3 rounded-xl flex items-center space-x-2 font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {mutation.isPending ? 'Submitting...' : (
                            <>
                                <span>Launch Idea</span>
                                <Send className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitIdea;
