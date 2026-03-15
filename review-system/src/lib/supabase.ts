// 这个客户端用于前端组件，受 RLS（行级安全策略）保护
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * 如果后续你在 Server Actions 或 API Routes 中需要更高权限（比如写入黑名单），
 * 可以定义一个使用 service_role 的 admin 客户端，
 * 但请注意：永远不要在 'use client' 文件中导出它！
 */

export const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            // 成功后跳回我们的回调处理页
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });
    if (error) console.error('登录失败:', error.message);
};

export const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // 简单粗暴的刷新
};