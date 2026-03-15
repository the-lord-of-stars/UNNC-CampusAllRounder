import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 使用 Deno.serve 是目前最稳定的写法
Deno.serve(async (req) => {
  // 1. 处理 CORS 预检
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. 初始化客户端
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. 获取并验证用户信息
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader) throw new Error('未检测到登录凭证')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) throw new Error('身份验证失败，请重新登录')

    // 4. 解析 Body (只解析一次，不要使用 clone)
    const body = await req.json()
    const { professor_id, quality, difficulty, content, review_type } = body

    if (!professor_id || !content) throw new Error('评价内容或教授信息缺失')

    // 5. 生成匿名指纹
    const SALT = Deno.env.get('ANON_SALT') || 'default_salt_123'
    const encoder = new TextEncoder()
    const data = encoder.encode(`${user.id}-${professor_id}-${SALT}`)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const fingerprint = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    // 6. 写入数据库
    const { error: insertError } = await supabaseClient
        .from('reviews')
        .insert({
          professor_id,
          comment_text: content,
          quality: Number(quality),
          difficulty: Number(difficulty),
          review_type,
          user_fingerprint: fingerprint,
          is_visible: true
        })

    if (insertError) {
      if (insertError.code === '23505') {
        const typeName = review_type === 'course' ? '课程评价' : '科研评价';
        throw new Error(`你已经提交过该教授的${typeName}了，请勿重复提交`);
      }
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Internal Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // 这会让前端收到 non-2xx，但 body 里会有具体的 error 字符串
    })
  }
})