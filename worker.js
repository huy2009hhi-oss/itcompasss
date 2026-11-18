// Cloudflare Worker: ẩn Gemini API key khỏi trình duyệt, giới hạn tần suất và kích thước yêu cầu.
// Biến môi trường: GEMINI_API_KEY (Secret), ALLOWED_ORIGINS (vd: https://ten-mien-cua-ban.com), GEMINI_MODEL (tùy chọn), RL (KV, tùy chọn)
const SYSTEM = "Bạn là AI Mentor hướng nghiệp CNTT cho học sinh, sinh viên và người chuyển ngành tại Việt Nam. Trả lời bằng tiếng Việt, ngắn gọn (tối đa khoảng 150 từ), thân thiện. Không bịa số liệu; lương và nhu cầu tuyển dụng chỉ là ước tính tham khảo. Không cam kết việc làm. Nếu câu hỏi ngoài lĩnh vực hướng nghiệp IT, nhẹ nhàng đưa người dùng quay lại chủ đề.";
const LIMIT_PER_MIN = 10;
const j = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...h } });
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = { 'Access-Control-Allow-Origin': ok ? origin : (allowed[0] || 'null'), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !ok) return j({ error: 'forbidden' }, 403, cors);
    const raw = await req.text();
    if (raw.length > 12000) return j({ error: 'too_large' }, 413, cors);
    let b; try { b = JSON.parse(raw); } catch { return j({ error: 'bad_json' }, 400, cors); }
    const contents = (Array.isArray(b.contents) ? b.contents : []).slice(-10).map(m => ({
      role: m && m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String((m && m.parts && m.parts[0] && m.parts[0].text) || '').slice(0, 600) }]
    }));
    if (!contents.length || contents[0].role !== 'user') return j({ error: 'bad_request' }, 400, cors);
    if (env.RL) { // giới hạn theo IP mỗi phút
      const ip = req.headers.get('CF-Connecting-IP') || 'x', k = 'rl:' + ip + ':' + Math.floor(Date.now() / 60000);
      const n = parseInt(await env.RL.get(k) || '0', 10);
      if (n >= LIMIT_PER_MIN) return j({ error: 'rate_limited' }, 429, cors);
      await env.RL.put(k, String(n + 1), { expirationTtl: 120 });
    }
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM + ' Ngữ cảnh: ' + String(b.context || '').slice(0, 800) }] }, contents, generationConfig: { maxOutputTokens: 600, temperature: 0.6 } })
    });
    if (!r.ok) return j({ error: 'upstream' }, r.status === 429 ? 429 : 502, cors);
    const d = await r.json();
    const text = (((d.candidates || [])[0] || {}).content || {}).parts;
    return j({ text: (text || []).map(p => p.text || '').join('') }, 200, cors);
  }
};
