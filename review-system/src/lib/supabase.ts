// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 这个客户端用于前端组件，受 RLS（行级安全策略）保护
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 如果后续你在 Server Actions 或 API Routes 中需要更高权限（比如写入黑名单），
 * 可以定义一个使用 service_role 的 admin 客户端，
 * 但请注意：永远不要在 'use client' 文件中导出它！
 */