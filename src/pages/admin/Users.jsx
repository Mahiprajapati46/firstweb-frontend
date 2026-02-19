import React, { useEffect, useState } from 'react';
import {
    Search,
    User,
    MoreVertical,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Mail,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/admin';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: 'bg-green-50 text-green-600',
        BLOCKED: 'bg-red-50 text-red-600',
        DELETED: 'bg-gray-50 text-gray-600',
    };

    const icons = {
        ACTIVE: <CheckCircle2 size={12} />,
        BLOCKED: <XCircle size={12} />,
        DELETED: <AlertCircle size={12} />,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
            {icons[status]}
            {status}
        </span>
    );
};

const RoleBadge = ({ role }) => {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isMerchant = role === 'MERCHANT';

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${isSuperAdmin ? 'bg-purple-50 text-purple-600 border-purple-100' :
                isMerchant ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-gray-50 text-gray-500 border-gray-100'
            }`}>
            {isSuperAdmin && <Shield size={10} />}
            {role}
        </span>
    );
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getUsers();
            // Backend returns { data: [...] }
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Filter and Pagination Logic
    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Users</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage platform users and access</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="text-center py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="text-right py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <User size={48} className="text-gray-300" />
                                            <p className="text-gray-400 font-bold text-sm">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-black text-gray-400 shrink-0">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-primary group-hover:text-accent transition-colors">
                                                        {user.full_name || 'Unknown User'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mt-0.5">
                                                        <Mail size={10} />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-8">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="py-4 px-8 text-center">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="py-4 px-8">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <Calendar size={12} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-8 text-right">
                                            <Link
                                                to={`/admin/users/${user._id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                            >
                                                View <ArrowRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400">
                            Showing {paginatedUsers.length} of {filteredUsers.length} users
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="text-xs py-2 h-auto"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="text-xs py-2 h-auto"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
