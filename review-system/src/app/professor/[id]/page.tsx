"use client"
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, ArrowLeft, GraduationCap, Microscope } from 'lucide-react';

export default function ProfessorPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. 使用 React.use() 解包 params
    const router = useRouter();
    const resolvedParams = use(params);
    const profId = resolvedParams.id;

    const [activeTab, setActiveTab] = useState<'course' | 'research'>('course');
    const [reviews, setReviews] = useState<any[]>([]);
    const [prof, setProf] = useState<any>(null);

    useEffect(() => {
        const fetchProf = async () => {
            const { data } = await supabase
                .from('professor_stats')
                .select('*')
                .eq('id', profId) // 使用解包后的 ID
                .single();
            setProf(data);
        };

        const fetchReviews = async () => {
            const { data } = await supabase
                .from('reviews')
                .select('*')
                .eq('professor_id', profId) // 使用解包后的 ID
                .eq('is_visible', true)
                .order('created_at', { ascending: false });
            setReviews(data || []);
        };

        if (profId) {
            fetchProf();
            fetchReviews();
        }
    }, [profId]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                返回教授列表
            </button>

            {/* ... 之前的 UI 代码保持不变，只需确保里面的变量名对齐 ... */}
            <header className="bg-white border rounded-3xl p-8 mb-8 shadow-sm flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">{prof?.name || '加载中...'}</h1>
                    <p className="text-gray-500 mt-1">{prof?.department}</p>
                    <div className="flex gap-4 mt-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">教学评分</span>
                            <span className="text-2xl font-black text-blue-600">{prof?.avg_teaching_quality?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="w-px h-10 bg-gray-100 mx-2" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">科研评分</span>
                            <span className="text-2xl font-black text-purple-600">{prof?.avg_research_quality?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl hover:bg-zinc-800 transition shadow-lg shadow-black/10 font-bold">
                    <MessageSquarePlus size={20} />
                    评价一下
                </button>
            </header>
        </div>
    );
}