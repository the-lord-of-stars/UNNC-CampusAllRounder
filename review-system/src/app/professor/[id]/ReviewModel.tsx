// 评价弹窗组件简版逻辑
"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function ReviewModal({ profId, onClose, onSuccess }: { profId: string, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        quality: 5,
        difficulty: 3,
        review_type: 'course', // 'course' 或 'research'
        content: ''
    });

    const handleSubmit = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            alert("请先登录");
            setLoading(false);
            return;
        }

        // 重点：强制转换数据类型
        const submitData = {
            professor_id: profId,
            quality: Number(formData.quality),    // 确保是数字
            difficulty: Number(formData.difficulty), // 确保是数字
            content: formData.content.trim(),     // 去除首尾空格
            review_type: formData.review_type
        };

        const { data, error } = await supabase.functions.invoke('submit-review', {
            body: submitData,
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (error) {
            let errorMsg = "提交失败，请稍后再试";

            if (error instanceof Error) {
                try {
                    const body = await error.context.json();
                    errorMsg = body.error || error.message;
                } catch {
                    errorMsg = error.message;
                }
            }

            alert(errorMsg);
            console.error("详细错误对象:", error);
        } else {
            alert("🎉 评价提交成功！");
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">发布匿名评价</h2>

                {/* 评分滑块或星星 */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">评价类型</label>
                        <select
                            className="w-full border rounded-xl p-2"
                            onChange={(e) => setFormData({...formData, review_type: e.target.value})}
                        >
                            <option value="course">课程评价</option>
                            <option value="research">科研/导师评价</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">教学/科研质量 ({formData.quality})</label>
                            <input type="range" min="1" max="5" step="1" className="w-full"
                                   value={formData.quality}
                                   onChange={(e) => setFormData({...formData, quality: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">难度/压力 ({formData.difficulty})</label>
                            <input type="range" min="1" max="5" step="1" className="w-full"
                                   value={formData.difficulty}
                                   onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content-input" className="block text-sm font-medium text-gray-700 mb-1">评价内容</label>
                        <textarea
                            id="content-input"
                            name="content"
                            className="w-full border rounded-2xl p-4 h-32 outline-none focus:ring-2 focus:ring-black"
                            placeholder="请客观评价你的感受..."
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500">取消</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-black text-white py-3 rounded-2xl font-bold hover:opacity-90 disabled:bg-gray-400"
                    >
                        {loading ? '提交中...' : '提交匿名评价'}
                    </button>
                </div>
            </div>
        </div>
    );
}