# IT Career Compass – bản công khai

Trang tĩnh, không cần máy chủ. CSS đã biên dịch sẵn (không dùng Tailwind CDN), không phụ thuộc thư viện icon.

## 1. Việc bắt buộc trước khi đăng
Tìm và thay trong `index.html`, `sitemap.xml`, `robots.txt`:
- `https://your-domain.example` → tên miền thật của bạn (không có dấu / ở cuối)
- `contact@your-domain.example` → email liên hệ thật

Rà lại nội dung: lương, nhu cầu tuyển dụng (ước tính, đối chiếu ITviec/TopDev/Navigos) và bấm thử các link tài nguyên.

## 2. Đưa lên mạng (chọn 1, đều miễn phí)
- **Cloudflare Pages / Netlify:** kéo thả cả thư mục này. File `_headers` sẽ tự bật CSP và các header bảo mật.
- **GitHub Pages:** đẩy các file lên repo, bật Pages. (Không đọc `_headers`, nhưng `index.html` đã có CSP trong thẻ meta.)
- Bật HTTPS (các nền tảng trên làm sẵn).

## 3. AI cho mọi người dùng (tùy chọn)
Mặc định khách phải tự nhập Gemini key, hoặc dùng chế độ trả lời mẫu. Muốn khách chat AI không cần key:
1. Tạo Cloudflare Worker, dán `ai-proxy/worker.js`.
2. Thêm Secret `GEMINI_API_KEY`, biến `ALLOWED_ORIGINS` = tên miền của bạn (vd `https://ten-mien.com`). Nên gắn KV tên `RL` để giới hạn 10 lượt/phút/IP.
3. Trong Google AI Studio, đặt hạn mức chi tiêu thấp cho key.
4. Mở `index.html`, tìm `AI_PROXY_URL:''` và điền URL Worker, ví dụ `AI_PROXY_URL:'https://ten-worker.ten-ban.workers.dev'`.
5. Trong thẻ meta Content-Security-Policy (và `_headers`), thêm URL Worker vào `connect-src`.
Không bao giờ ghi key trực tiếp vào `index.html`.

## 4. Kiểm tra sau khi đăng
- Dán link vào Facebook Sharing Debugger để kiểm tra ảnh chia sẻ.
- Chạy Lighthouse/PageSpeed trên điện thoại.
- Mở bằng điện thoại: làm trắc nghiệm, lưu kết quả, mở chi tiết ngành.

## Dữ liệu
Toàn bộ dữ liệu ngành nằm trong `index.html` (khối `data-careers`, `data-general`). Khi cập nhật, sửa số liệu và ngày "cập nhật".
