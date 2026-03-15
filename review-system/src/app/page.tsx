"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 引入刚才创建的实例
import { Search, GraduationCap, Microscope } from 'lucide-react';
import Link from 'next/link';
import { signInWithGithub, signOut } from '@/lib/supabase';

interface Professor {
    id: string;
    name: string;
    department: string;
    avg_teaching_quality: number | null;
    avg_research_quality: number | null;
    total_reviews: number;
}

export default function HomePage() {
    const [search, setSearch] = useState('');
    const [profs, setProfs] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // 检查初始 Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // 监听 Auth 状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfs = async () => {
            setLoading(true);

            // 从我们之前创建的视图 'professor_stats' 中读取数据
            let query = supabase
                .from('professor_stats') // 使用统计视图性能更好
                .select('*')
                .order('avg_teaching_quality', { ascending: false }) // 按评分排序
                .range(0, 5); // 默认取前6个

            if (search) {
                query = query.ilike('name', `%${search}%`); // 简单的模糊搜索
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching professors:', error);
            } else {
                setProfs(data || []);
            }
            setLoading(false);
        };

        // 防抖处理：避免输入每个字母都请求数据库
        const timer = setTimeout(() => fetchProfs(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <main className="max-w-6xl mx-auto p-6">
            <nav className="flex justify-end p-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">你好, {user.user_metadata.full_name}</span>
                        <button onClick={signOut} className="text-xs text-red-500">退出</button>
                    </div>
                ) : (
                    <button
                        onClick={signInWithGithub}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        GitHub 登录
                    </button>
                )}
            </nav>

            {/* Header */}
            <div className="flex flex-col items-center my-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight">CS Professor Ranking</h1>
                <p className="text-gray-500 mt-2">计算机学院教授与科研导师评价系统</p>
            </div>

            {/* 搜索框 */}
            <div className="relative max-w-xl mx-auto mb-12">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="输入教授姓名或研究方向..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">加载中...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profs.map((prof) => (
                        <Link href={`/professor/${prof.id}`} key={prof.id}>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{prof.name}</h3>
                                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">{prof.department}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-500 gap-1">
                      <GraduationCap size={16} /> 教学质量
                    </span>
                                        <span className="font-bold text-orange-500">
  {prof.avg_teaching_quality ? prof.avg_teaching_quality.toFixed(1) : '暂无'}
</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-gray-500 gap-1">
                      <Microscope size={16} /> 科研氛围
                    </span>
                                        <span className="font-bold text-purple-500">
                      {prof.avg_research_quality?.toFixed(1) || 'N/A'}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}