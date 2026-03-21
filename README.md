# RoboTun — Blog cá nhân

Blog chia sẻ kiến thức lập trình, lưu trữ trên **GitHub Pages**.  
Mỗi bài viết là một file JSON riêng biệt — dễ viết, dễ quản lý.

---

## 🗂 Cấu trúc thư mục

```
blog/
├── index.html          # Trang chính
├── style.css           # Giao diện
├── app.js              # Logic ứng dụng
└── posts/
    ├── index.json      # ← DANH SÁCH bài viết (bắt buộc cập nhật)
    ├── post-1.json
    ├── post-2.json
    └── ...
```

---

## ✍️ Viết bài mới

### Bước 1 — Tạo file JSON

Tạo file mới trong thư mục `posts/`, ví dụ `posts/ten-bai.json`:

```json
{
  "id": "ten-bai-viet",
  "title": "Tiêu đề bài viết",
  "excerpt": "Mô tả ngắn gọn hiện trên card.",
  "date": "2024-04-01",
  "author": "Tên bạn",
  "tags": ["javascript", "web"],
  "content": "Nội dung viết bằng **Markdown**..."
}
```

### Bước 2 — Thêm vào index.json

Mở `posts/index.json` và thêm tên file vào danh sách:

```json
[
  "post-1.json",
  "post-2.json",
  "ten-bai.json"
]
```

### Bước 3 — Commit & Push

```bash
git add posts/
git commit -m "Thêm bài: Tiêu đề bài viết"
git push
```

---

## 📝 Cú pháp Markdown hỗ trợ

| Cú pháp | Kết quả |
|---|---|
| `**text**` | **in đậm** |
| `*text*` | *in nghiêng* |
| `## Tiêu đề` | Heading 2 |
| `### Tiêu đề` | Heading 3 |
| `` `code` `` | inline code |
| ` ```js ... ``` ` | Code block |
| `> text` | Blockquote |
| `[text](url)` | Link |
| `![alt](url)` | Hình ảnh |
| `---` | Đường kẻ ngang |

---

## 🚀 Deploy lên GitHub Pages

1. Tạo repository mới trên GitHub (ví dụ: `username.github.io`)
2. Push toàn bộ code lên branch `main`
3. Vào **Settings → Pages → Source**: chọn `main` branch, thư mục `/ (root)`
4. GitHub sẽ tự động deploy sau vài phút

**URL blog**: `https://username.github.io`  
Hoặc nếu dùng repo khác: `https://username.github.io/ten-repo`

---

## ⚙️ Tùy chỉnh

Mở `index.html` để đổi:
- **Tên blog**: tìm `RoboTun` và thay bằng tên của bạn
- **Tagline**: tìm `// kiến thức · chia sẻ · phát triển`
- **Mô tả hero**: tìm `hero-desc`

---

## 📋 Schema bài viết

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `id` | ✅ | ID duy nhất, dùng trong URL (không dấu, không space) |
| `title` | ✅ | Tiêu đề bài |
| `excerpt` | ✅ | Mô tả ngắn (hiện trên card) |
| `date` | ✅ | Ngày đăng: `YYYY-MM-DD` |
| `content` | ✅ | Nội dung Markdown |
| `tags` | ❌ | Mảng string, dùng để lọc |
| `author` | ❌ | Tên tác giả |


python -m http.server 8080
