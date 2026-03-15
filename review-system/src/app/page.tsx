"use client"
import { useState, useEffect } from 'react';
import { Search, GraduationCap, Microscope } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [profs, setProfs] = useState([]);

  // 模拟从 Supabase 获取数据 (后续对接真正的 fetch)
  const fetchProfs = async () => {
    // 逻辑：supabase.from('professors').select('*').ilike('name', `%${search}%`).range(0, 5)
  };

  return (
      <main className="max-w-6xl mx-auto p-6">
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

        {/* 教授卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
              <Link href={`/professor/${i}`} key={i}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">王小明 教授</h3>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">CS系</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-500 gap-1">
                    <GraduationCap size={16} /> 教学质量
                  </span>
                      <span className="font-bold text-orange-500">4.8 / 5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-500 gap-1">
                    <Microscope size={16} /> 科研氛围
                  </span>
                      <span className="font-bold text-purple-500">4.2 / 5.0</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#给分慷慨</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#学术大牛</span>
                  </div>
                </div>
              </Link>
          ))}
        </div>

        {/* 加载更多 */}
        <div className="flex justify-center mt-12">
          <button className="px-8 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition text-sm font-medium">
            加载更多教授
          </button>
        </div>
      </main>
  );
}