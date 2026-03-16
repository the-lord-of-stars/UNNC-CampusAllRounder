"use client"
import { useState, useEffect } from 'react';
import { supabase, signInWithGithub, signOut } from '@/lib/supabase';
import { Search, GraduationCap, Microscope, Plus, LogOut, Github, Trophy, Flame, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 6;

export default function HomePage() {
    const [search, setSearch] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [courseOptions, setCourseOptions] = useState<any[]>([]);
    const [profs, setProfs] = useState<any[]>([]);
    const [topTeaching, setTopTeaching] = useState<any[]>([]);
    const [topResearch, setTopResearch] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [user, setUser] = useState<any>(null);

    // 1. 初始化基础数据
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        const initData = async () => {
            // 获取下拉菜单所需的课程列表
            const { data: cData } = await supabase.from('courses').select('id, course_code, course_name').order('course_code');
            setCourseOptions(cData || []);

            // 获取排行榜 (Top 5)
            const fetchTop = async (column: string) => {
                const { data } = await supabase
                    .from('professor_stats')
                    .select('*')
                    .not(column, 'is', null)
                    .gt('total_reviews', 0)
                    .order(column, { ascending: false, nullsFirst: false })
                    .limit(5);
                return data || [];
            };

            const [tData, rData] = await Promise.all([fetchTop('avg_teaching_quality'), fetchTop('avg_research_quality')]);
            setTopTeaching(tData);
            setTopResearch(rData);
        };
        initData();
        return () => subscription.unsubscribe();
    }, []);

    // 2. 核心抓取逻辑：联表查询 + 课程标签提取
    const fetchProfs = async (isNewSearch: boolean, targetPage: number) => {
        if (isNewSearch) setLoading(true);
        else setLoadingMore(true);

        const from = targetPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // 构建查询：关联中间表和课程表以获取标签
        // 使用 !inner 实现硬筛选（如果选了特定课程）
        const joinType = selectedCourseId === 'all' ? 'course_professors' : 'course_professors!inner';

        let query = supabase
            .from('professor_stats')
            .select(`
                *,
                ${joinType} (
                    course_id,
                    courses (course_code)
                )
            `)
            .order('avg_teaching_quality', { ascending: false, nullsFirst: false })
            .range(from, to);

        if (search) query = query.ilike('name', `%${search}%`);

        if (selectedCourseId !== 'all') {
            query = query.eq('course_professors.course_id', selectedCourseId);
        }

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
        const timer = setTimeout(() => {
            setPage(0);
            fetchProfs(true, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCourseId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProfs(false, nextPage);
    };

    // 榜单渲染组件 (抽离以复用)
    const LeaderboardSection = ({ title, icon: Icon, data, scoreKey, colorClass }: any) => {
        
        // 根据排名获取不同颜色的函数 (金、银、铜、普通)
        const getRankStyle = (index: number) => {
            if (index === 0) return 'bg-yellow-400 text-white shadow-sm'; // 第一名：金
            if (index === 1) return 'bg-slate-300 text-white shadow-sm';  // 第二名：银
            if (index === 2) return 'bg-orange-400 text-white shadow-sm'; // 第三名：铜
            return 'bg-gray-50 text-gray-400 border border-gray-100';     // 第四名及以后：低调的灰底
        };

        return (
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <Icon size={20} className={colorClass} />
                    <h3 className="font-black tracking-tight">{title}</h3>
                </div>
                <div className="space-y-4">
                    {data.map((prof: any, index: number) => (
                        <Link href={`/professor/${prof.id}`} key={`${title}-${prof.id}`} className="flex items-center gap-3 group">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${getRankStyle(index)}`}>
                                {index + 1}
                            </span>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{prof.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{prof.department}</p>
                            </div>
                            <span className={`text-xs font-black ${colorClass}`}>{Number(prof[scoreKey])?.toFixed(1)}</span>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="max-w-[1500px] mx-auto p-6 min-h-screen bg-[#FDFDFD]">
            {/* 顶部导航 */}
            <nav className="flex flex-col md:flex-row justify-between items-center py-6 mb-12 px-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm gap-6">
                <div className="font-black text-3xl tracking-tighter italic select-none">HIT.PROF</div>

                <div className="flex flex-1 items-center gap-3 max-w-3xl w-full">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="寻找教授..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-black outline-none text-sm transition-all font-medium"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-1.5 shadow-sm hover:border-gray-300 transition-all">
                        <BookOpen size={16} className="text-blue-500 mr-2" />
                        <select
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer text-gray-700 py-1.5 pr-2 min-w-[140px]"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="all">所有课程</option>
                            {courseOptions.map(c => (
                                <option key={c.id} value={c.id}>[{c.course_code}] {c.course_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 pr-4 rounded-2xl">
                            <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-xl border-2 border-white shadow-sm" alt="" />
                            <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
                        </div>
                    ) : (
                        <button onClick={signInWithGithub} className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2">
                            <Github size={18} /> LOGIN
                        </button>
                    )}
                </div>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* 左侧：主列表 */}
                <div className="flex-1 min-w-0">
                    <div className="mb-10 px-2">
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">
                            {selectedCourseId === 'all' ? '发现优秀导师' : '该课程下的教师'}
                        </h2>
                        <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Selected Filter: {selectedCourseId === 'all' ? 'Universal' : 'Specific Course'}</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-[3rem]" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {profs.map((prof) => (
                                <Link href={`/professor/${prof.id}`} key={prof.id}>
                                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:border-black hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{prof.name}</h3>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{prof.department}</p>
                                            </div>
                                            {prof.total_reviews > 8 && (
                                                <div className="bg-orange-50 text-orange-500 p-2 rounded-xl">
                                                    <Flame size={20} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 课程标签区域 */}
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {prof.course_professors?.slice(0, 3).map((cp: any, idx: number) => (
                                                <span key={idx} className="text-[9px] font-black bg-gray-50 text-gray-400 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                                                    {cp.courses?.course_code}
                                                </span>
                                            ))}
                                            {prof.course_professors?.length > 3 && (
                                                <span className="text-[9px] font-black text-gray-300 py-1">+{prof.course_professors.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex gap-4">
                                            <div className="flex-1 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                                                <p className="text-[9px] font-black text-blue-300 uppercase mb-1">Teaching</p>
                                                <p className="text-2xl font-black text-blue-600">{prof.avg_teaching_quality?.toFixed(1) || 'N/A'}</p>
                                            </div>
                                            <div className="flex-1 bg-purple-50/30 p-4 rounded-2xl border border-purple-50">
                                                <p className="text-[9px] font-black text-purple-300 uppercase mb-1">Research</p>
                                                <p className="text-2xl font-black text-purple-600">{prof.avg_research_quality?.toFixed(1) || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {hasMore && !loading && (
                        <button onClick={handleLoadMore} disabled={loadingMore} className="w-full mt-12 py-5 rounded-[2.5rem] bg-white border-2 border-gray-50 font-black text-gray-400 hover:text-black hover:border-black transition-all shadow-sm flex items-center justify-center gap-3">
                            {loadingMore ? "SYNCING..." : <><Plus size={20} /> MORE PROFESSORS</>}
                        </button>
                    )}
                </div>

                {/* 右侧：侧边栏 */}
                <div className="w-full lg:w-80 space-y-8 sticky top-10 h-fit">
                    <LeaderboardSection title="教学红榜" icon={Trophy} data={topTeaching} scoreKey="avg_teaching_quality" colorClass="text-blue-600" />
                    <LeaderboardSection title="科研红榜" icon={Microscope} data={topResearch} scoreKey="avg_research_quality" colorClass="text-purple-600" />

                    <div className="p-10 bg-zinc-900 rounded-[3rem] text-white shadow-2xl shadow-zinc-200 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                        <p className="text-[10px] font-black text-blue-400 mb-2 tracking-[0.2em] uppercase">Feedback</p>
                        <h4 className="text-xl font-bold mb-6 leading-tight">未找到教授？</h4>
                        <a
                            href="https://github.com/the-lord-of-stars/UNNC-CampusAllRounder/issues/new?title=%E3%80%90%E6%B7%BB%E5%8A%A0%E6%95%99%E6%8E%88%E3%80%91"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl text-xs font-black hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-black/20"
                        >
                            GO GITHUB <ChevronRight size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}