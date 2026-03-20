# Cách thêm bài viết mới

## Bước 1 — Tạo file JS cho bài viết

Tạo file mới trong thư mục `posts/`, đặt tên theo ID bài:

**`posts/ten-bai-viet.js`**
```js
POSTS_DATA.push({
  id: "ten-bai-viet",
  title: "Tiêu đề bài viết",
  excerpt: "Mô tả ngắn hiện trên card.",
  date: "2024-05-01",
  author: "Tên bạn",
  tags: ["stm32", "mcu", "uart"],
  content: `## Heading

Nội dung **Markdown** viết thoải mái.

\`\`\`c
int main(void) { return 0; }
\`\`\`
`
});
```

## Bước 2 — Thêm 1 dòng vào index.html

Mở `index.html`, tìm vùng comment `POSTS` ở cuối file, thêm vào:

```html
<script src="posts/ten-bai-viet.js"></script>
```

Ví dụ sau khi thêm:
```html
<script src="posts/posts.js"></script>
<script src="posts/embedded-linux-device-driver.js"></script>
<script src="posts/stm32-uart-dma.js"></script>
<script src="posts/ten-bai-viet.js"></script>  ← thêm vào đây
<script src="app.js"></script>
```

## Bước 3 — Lưu & xem

Mở `index.html` trong trình duyệt → bài hiện ngay, không cần server!

---

## Tags → Chuyên mục

| Tags | Chuyên mục |
|---|---|
| `linux`, `kernel`, `driver`, `device-tree`, `buildroot`, `yocto` | Embedded Linux |
| `stm32`, `esp32`, `avr`, `rtos`, `hal`, `uart`, `spi`, `i2c`, `dma` | Embedded MCU |
| `vhdl`, `verilog`, `vivado`, `quartus`, `rtl`, `fpga` | FPGA |
| `ros`, `ros2`, `slam`, `kinematics`, `pid`, `gazebo` | Robot |
| `algorithm`, `data-structure`, `sorting`, `graph`, `dp` | Algorithm |
| `python`, `numpy`, `opencv`, `pyserial`, `automation` | Python |
| `makefile`, `cmake`, `toolchain`, `gcc`, `linker` | Makefile |
| `gdb`, `openocd`, `jtag`, `swd`, `valgrind`, `strace` | Debug Tool |

---

## Markdown hỗ trợ

| Cú pháp | Kết quả |
|---|---|
| `**text**` | **in đậm** |
| `*text*` | *in nghiêng* |
| `## Heading` | Tiêu đề H2 |
| `### Heading` | Tiêu đề H3 |
| `` `code` `` | inline code |
| ` ```c ... ``` ` | code block C |
| `> text` | blockquote |
| `- item` | danh sách |
| `[text](url)` | link |
| `---` | đường kẻ ngang |
