"use client"
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, ArrowLeft, GraduationCap, Microscope, Calendar, LogIn } from 'lucide-react';
import { ReviewModal } from './ReviewModel.tsx';

export default function ProfessorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: profId } = use(params);

    const [activeTab, setActiveTab] = useState<'course' | 'research'>('course');
    const [reviews, setReviews] = useState<any[]>([]);
    const [prof, setProf] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState<any>(null); // 新增：用户状态

    // 获取数据
    const fetchData = async () => {
        const { data: profData } = await supabase.from('professor_stats').select('*').eq('id', profId).single();
        setProf(profData);

        const { data: reviewData } = await supabase.from('reviews')
            .select('*')
            .eq('professor_id', profId)
            .eq('is_visible', true)
            .order('created_at', { ascending: false });
        setReviews(reviewData || []);
    };

    // 监听登录状态
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        if (profId) fetchData();
        return () => subscription.unsubscribe();
    }, [profId]);

    // 登录函数
    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.href }
        });
    };

    const filteredReviews = reviews.filter(r => r.review_type === activeTab);

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen">
            {/* 顶部导航：返回 + 登录状态 */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => router.back()} className="group flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-medium">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    返回教授列表
                </button>

                {!user && (
                    <button onClick={handleLogin} className="flex items-center gap-2 text-sm font-bold bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl transition">
                        <LogIn size={16} /> GitHub 登录
                    </button>
                )}
            </div>

            {/* 顶部：教授概览 */}
            <header className="bg-white border rounded-3xl p-8 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900">{prof?.name || '加载中...'}</h1>
                    <p className="text-gray-500 mt-2 font-medium">{prof?.department || '计算机学院'}</p>
                    <div className="flex gap-8 mt-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">教学质量</span>
                            <span className="text-3xl font-black text-blue-600">{prof?.avg_teaching_quality?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">科研氛围</span>
                            <span className="text-3xl font-black text-purple-600">{prof?.avg_research_quality?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* 动态按钮：没登录就变登录按钮 */}
                {user ? (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl hover:bg-zinc-800 transition shadow-xl shadow-black/10 font-bold w-full md:w-auto justify-center"
                    >
                        <MessageSquarePlus size={20} />
                        发表评价
                    </button>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 font-bold w-full md:w-auto justify-center"
                    >
                        <LogIn size={20} />
                        登录后评价
                    </button>
                )}
            </header>

            {/* Tab 切换 (保持不变) */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-8 w-fit">
                <button
                    onClick={() => setActiveTab('course')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition ${activeTab === 'course' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <GraduationCap size={18} /> 课程评价
                </button>
                <button
                    onClick={() => setActiveTab('research')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition ${activeTab === 'research' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Microscope size={18} /> 科研导师评价
                </button>
            </div>

            {/* 评价列表 (注意修改这里的 content 字段名) */}
            <div className="space-y-6">
                {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="bg-gray-50 px-3 py-1 rounded-lg">
                                        <span className="text-xs text-gray-400 block uppercase font-bold">质量</span>
                                        <span className="font-black text-lg">{Number(review.quality).toFixed(1)}</span>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-1 rounded-lg">
                                        <span className="text-xs text-gray-400 block uppercase font-bold">难度</span>
                                        <span className="font-black text-lg">{Number(review.difficulty).toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="text-gray-400 flex items-center gap-1 text-sm">
                                    <Calendar size={14} />
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {/* 注意：根据你的表结构，这里要用 comment_text */}
                            <p className="text-gray-700 leading-relaxed text-lg mb-4 whitespace-pre-wrap">
                                {review.comment_text}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded uppercase font-bold">
                                    ID: {review.user_fingerprint?.substring(0, 8)}...
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">还没有相关评价，快去抢首评吧！</p>
                    </div>
                )}
            </div>

            {showModal && (
                <ReviewModal
                    profId={profId}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}