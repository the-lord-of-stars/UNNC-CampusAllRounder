"use client"
import { useState, useEffect } from 'react';
import { supabase, signInWithGithub, signOut } from '@/lib/supabase';
import { Search, GraduationCap, Microscope, Plus, LogOut, Github } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 6;

export default function HomePage() {
    const [search, setSearch] = useState('');
    const [profs, setProfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [user, setUser] = useState<any>(null);

    // 1. 登录状态监听
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // 2. 核心数据抓取 (带去重逻辑)
    const fetchProfs = async (isNewSearch: boolean, targetPage: number) => {
        if (isNewSearch) setLoading(true);
        else setLoadingMore(true);

        const from = targetPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from('professor_stats')
            .select('*')
            .order('avg_teaching_quality', { ascending: false })
            .range(from, to);

        if (search) query = query.ilike('name', `%${search}%`);

        const { data, error } = await query;

        if (!error && data) {
            setProfs(prev => {
                if (isNewSearch) return data;
                // 关键：防止重复 Key 的去重逻辑
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewData = data.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewData];
            });
            setHasMore(data.length === PAGE_SIZE);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    // 3. 监听搜索 (重置分页)
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            fetchProfs(true, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // 4. 加载更多
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProfs(false, nextPage);
    };

    return (
        <main className="max-w-6xl mx-auto p-6 min-h-screen bg-white">
            {/* 导航栏 */}
            <nav className="flex justify-between items-center py-4">
                <div className="font-black text-xl tracking-tighter">HIT.PROF</div>
                {user ? (
                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 pr-4 rounded-2xl border border-gray-100">
                        <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-xl shadow-sm" alt="avatar" />
                        <span className="text-sm font-bold text-gray-700">{user.user_metadata.full_name}</span>
                        <button onClick={signOut} className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button onClick={signInWithGithub} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl font-bold hover:scale-105 transition-all active:scale-95 shadow-lg shadow-black/10">
                        <Github size={18} /> GitHub Login
                    </button>
                )}
            </nav>

            {/* 英雄区 */}
            <div className="text-center py-20">
                <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">Professor Review</h1>
                <p className="text-gray-400 text-lg font-medium max-w-lg mx-auto">匿名分享课程评价与科研氛围</p>
            </div>

            {/* 搜索 */}
            <div className="relative max-w-2xl mx-auto mb-16">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
                <input
                    type="text"
                    placeholder="输入教授姓名搜索..."
                    className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:border-black outline-none transition-all text-xl font-medium"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* 列表区 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-[2rem]" />)}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {profs.map((prof) => (
                            <Link href={`/professor/${prof.id}`} key={prof.id}>
                                <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 cursor-pointer">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{prof.name}</h3>
                                            <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{prof.department}</p>
                                        </div>
                                        {prof.total_reviews > 5 && <span className="text-xl">🔥</span>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50/50 p-4 rounded-3xl">
                                            <span className="text-[10px] font-black text-blue-400 uppercase block mb-1">Teaching</span>
                                            <span className="text-2xl font-black text-blue-600">{prof.avg_teaching_quality?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                        <div className="bg-purple-50/50 p-4 rounded-3xl">
                                            <span className="text-[10px] font-black text-purple-400 uppercase block mb-1">Research</span>
                                            <span className="text-2xl font-black text-purple-600">{prof.avg_research_quality?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-20">
                            <button onClick={handleLoadMore} disabled={loadingMore} className="flex items-center gap-3 px-10 py-4 rounded-3xl border-2 border-gray-100 font-black hover:border-black hover:bg-black hover:text-white transition-all disabled:opacity-30">
                                {loadingMore ? "LOADING..." : <><Plus size={20} /> LOAD MORE</>}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}