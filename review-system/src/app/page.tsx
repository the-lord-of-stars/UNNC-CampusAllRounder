"use client"
import { useState, useEffect } from 'react';
import { supabase, signInWithGithub, signOut } from '@/lib/supabase';
import { Search, GraduationCap, Microscope, Plus, LogOut, Github, Trophy, Flame, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 6;

export default function HomePage() {
    const [search, setSearch] = useState('');
    const [profs, setProfs] = useState<any[]>([]);
    const [topTeaching, setTopTeaching] = useState<any[]>([]); // 教学榜
    const [topResearch, setTopResearch] = useState<any[]>([]); // 科研榜
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // 同时获取两个榜单
        const fetchLeaderboards = async () => {
            const { data: teaching } = await supabase
                .from('professor_stats')
                .select('*')
                .order('avg_teaching_quality', { ascending: false, nullsFirst: false})
                .range(0, 4);
            setTopTeaching(teaching || []);

            const { data: research } = await supabase
                .from('professor_stats')
                .select('*')
                .order('avg_research_quality', { ascending: false, nullsFirst: false })
                .range(0, 4);
            setTopResearch(research || []);
        };
        fetchLeaderboards();

        return () => subscription.unsubscribe();
    }, []);

    // 数据加载逻辑 (fetchProfs) 保持之前逻辑不变...
    const fetchProfs = async (isNewSearch: boolean, targetPage: number) => {
        if (isNewSearch) setLoading(true);
        else setLoadingMore(true);
        const from = targetPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let query = supabase.from('professor_stats').select('*').order('avg_teaching_quality', { ascending: false }).range(from, to);
        if (search) query = query.ilike('name', `%${search}%`);
        const { data, error } = await query;
        if (!error && data) {
            setProfs(prev => {
                if (isNewSearch) return data;
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewData = data.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewData];
            });
            setHasMore(data.length === PAGE_SIZE);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => { setPage(0); fetchProfs(true, 0); }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProfs(false, nextPage);
    };

    // 榜单渲染组件 (抽离以复用)
    const LeaderboardSection = ({ title, icon: Icon, data, scoreKey, colorClass }: any) => (
        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
                <Icon size={20} className={colorClass} />
                <h3 className="font-black tracking-tight">{title}</h3>
            </div>
            <div className="space-y-4">
                {data.map((prof: any, index: number) => (
                    <Link href={`/professor/${prof.id}`} key={`${title}-${prof.id}`} className="flex items-center gap-3 group">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            index === 0 ? 'bg-yellow-400 text-white' : 'bg-white text-gray-400 border border-gray-100'
                        }`}>
                            {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{prof.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{prof.department}</p>
                        </div>
                        <span className={`text-xs font-black ${colorClass}`}>{prof[scoreKey]?.toFixed(1)}</span>
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <main className="max-w-[1500px] mx-auto p-6 min-h-screen">
            {/* 顶部导航 */}
            <nav className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-8">
                    <div className="font-black text-2xl tracking-tighter">HIT.PROF</div>
                    <div className="hidden md:flex relative group w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="快速寻找教授..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-sm transition-all shadow-sm group-hover:border-gray-300"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {user ? (
                    <div className="flex items-center gap-4">
                        <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-xl shadow-sm" alt="avatar" />
                        <span className="text-sm font-bold text-gray-600">{user.user_metadata.full_name}</span>
                        <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
                    </div>
                ) : (
                    <button onClick={signInWithGithub} className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all">登录</button>
                )}
            </nav>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* 左侧：主列表 */}
                <div className="flex-1">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-2">探索评价</h2>
                            <p className="text-gray-400 font-medium">共发现 {profs.length}+ 位教师的数据更新</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-56 bg-gray-50 rounded-[2.5rem]" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {profs.map((prof) => (
                                <Link href={`/professor/${prof.id}`} key={prof.id}>
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900">{prof.name}</h3>
                                                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded font-bold uppercase tracking-widest mt-2 inline-block">
                                                    {prof.department}
                                                </span>
                                            </div>
                                            {prof.total_reviews > 10 && <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg italic">HOT</span>}
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl">
                                                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Teaching</p>
                                                <p className="text-2xl font-black text-blue-600">{prof.avg_teaching_quality?.toFixed(1)}</p>
                                            </div>
                                            <div className="flex-1 bg-purple-50/50 p-4 rounded-2xl">
                                                <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Research</p>
                                                <p className="text-2xl font-black text-purple-600">{prof.avg_research_quality?.toFixed(1)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <button onClick={handleLoadMore} disabled={loadingMore} className="w-full mt-12 py-5 rounded-[2rem] bg-zinc-50 font-black text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all">
                            {loadingMore ? "正在同步数据..." : "查看更多教授记录"}
                        </button>
                    )}
                </div>

                {/* 右侧：双榜单 */}
                <div className="w-full lg:w-80 space-y-8 sticky top-6">
                    {/* 教学红榜 */}
                    <LeaderboardSection
                        title="教学之星"
                        icon={GraduationCap}
                        data={topTeaching}
                        scoreKey="avg_teaching_quality"
                        colorClass="text-blue-600"
                    />

                    {/* 科研红榜 */}
                    <LeaderboardSection
                        title="科研大牛"
                        icon={Microscope}
                        data={topResearch}
                        scoreKey="avg_research_quality"
                        colorClass="text-purple-600"
                    />

                    {/* 快捷反馈 */}
                    <div className="p-6 bg-black rounded-[2rem] text-white">
                        <p className="text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">找不到教授？</p>
                        <p className="text-sm font-medium mb-4">前往 GitHub 提交 Issue，联系管理员快速添加缺失的教师信息</p>
                        <a
                            href="https://github.com/the-lord-of-stars/UNNC-CampusAllRounder/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 bg-white text-black rounded-xl text-xs font-black hover:bg-zinc-200 transition-colors text-center"
                        >
                            申请添加
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}