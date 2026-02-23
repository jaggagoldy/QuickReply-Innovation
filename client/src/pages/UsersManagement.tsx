import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Briefcase, Mail, Calendar, ChevronDown } from 'lucide-react';

const UsersManagement = () => {
    const queryClient = useQueryClient();
    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) =>
            api.patch(`/users/${userId}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div></div>;

    const roles = ['EMPLOYEE', 'REVIEWER', 'PM', 'ADMIN', 'SUPER_ADMIN'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-slate-400 mt-1">Manage platform users and their access levels.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">User Details</th>
                                <th className="px-6 py-4 font-medium">Department</th>
                                <th className="px-6 py-4 font-medium">Account Info</th>
                                <th className="px-6 py-4 font-medium">Access Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center space-x-1">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-slate-300">
                                            <Briefcase className="h-4 w-4 text-slate-500" />
                                            <span>{user.department || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group/select inline-block w-40">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                                className={`w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 pr-8 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all ${user.role === 'SUPER_ADMIN' ? 'text-pink-400 border-pink-400/30' :
                                                        user.role === 'ADMIN' ? 'text-primary-400 border-primary-400/30' :
                                                            'text-slate-300 border-slate-700'
                                                    }`}
                                            >
                                                {roles.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;
