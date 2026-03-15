"use client"
import { useState } from 'react';

export default function ProfessorDetail() {
    const [tab, setTab] = useState<'course' | 'research'>('course');

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* 教授头部详情已省略... */}

            {/* 切换 Tab */}
            <div className="flex gap-8 border-b mb-8">
                <button
                    onClick={() => setTab('course')}
                    className={`pb-4 text-sm font-bold transition ${tab === 'course' ? 'border-b-2 border-black' : 'text-gray-400'}`}
                >
                    课程评价 (12)
                </button>
                <button
                    onClick={() => setTab('research')}
                    className={`pb-4 text-sm font-bold transition ${tab === 'research' ? 'border-b-2 border-black' : 'text-gray-400'}`}
                >
                    科研/导师评价 (5)
                </button>
            </div>

            {/* 评论列表项示例 */}
            <div className="bg-white border rounded-2xl p-6 mb-4">
                <div className="flex justify-between mb-4">
                    <div className="flex gap-4">
                        <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-[10px] text-gray-400 uppercase">Quality</p>
                            <p className="text-lg font-black text-blue-600">5.0</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-[10px] text-gray-400 uppercase">Difficulty</p>
                            <p className="text-lg font-black text-red-400">2.0</p>
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                        COMP3007 • Feb 5th, 2025
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs font-medium text-gray-600">
                    <span>For Credit: <b className="text-black">Yes</b></span>
                    <span>Attendance: <b className="text-black">No</b></span>
                    <span>Grade: <b className="text-black">A+</b></span>
                    <span>Again: <b className="text-black">Yes</b></span>
                </div>

                <p className="text-gray-700 leading-relaxed">
                    Xin is genuinely one of the nicest professors ever... (评价正文)
                </p>

                {/* 点赞按钮 */}
                <div className="mt-4 flex gap-4">
                    <button className="text-xs border px-3 py-1 rounded-full hover:bg-gray-50">👍 12</button>
                    <button className="text-xs border px-3 py-1 rounded-full hover:bg-gray-50">👎 0</button>
                </div>
            </div>
        </div>
    );
}