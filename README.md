# 🧋 Tiệm Trà Sữa Nhỏ - Boba Shop Simulator

Game mô phỏng mở quán trà sữa online chơi trực tiếp trên trình duyệt, không cần cài đặt.
Lấy cảm hứng từ cơ chế mô phỏng kinh doanh của *Tiệm Mì Cay* ([aenhatrang.com](https://aenhatrang.com/)).

---

## ✨ Tính năng nổi bật
- **Chọn Size Ly M & L:** Rút ly nhựa Size M (500ml) hoặc Size L (700ml) từ chồng ly đặt lên bàn gỗ pha chế.
- **Pha chế tương tác trực quan:** 
  - 4 loại cốt trà: *Hồng trà, Trà Ô long, Lục trà lài, Matcha Nhật*.
  - Bộ chọn tỉ lệ *Đường (0% - 100%)* & *Đá (Nóng - 100%)*.
  - 6 loại topping: *Trân châu đen, Trân châu trắng, Pudding trứng, Kem cheese, Thạch dừa, Đào miếng*.
  - Máy lắc Shaker & Máy dập màng nắp ly.
- **Khách hàng sinh động:** Hàng đợi khách tại quầy, vòng đo kiên nhẫn SVG, biểu cảm vui vẻ/sốt ruột/tức giận, tiền tip hào phóng.
- **Quản lý kinh doanh (Tycoon):**
  - Nhập hàng (Restock) nguyên liệu và ly nhựa mỗi ngày.
  - Nâng cấp quán (Máy dập tự động, Điều hòa giảm cáu, Loa Lofi tăng tip, Mèo chiêu tài).
  - Sổ sách tài chính chi tiết & xem đánh giá (Reviews) của khách sau mỗi ca bán.
- **Thuần Client-side (Không cần Database):** Lưu toàn bộ tiến trình qua `localStorage`.
- **Hỗ trợ Responsive:** Tối ưu hoàn hảo cho cả Di động (< 600px) và Máy tính / iPad (bố cục 2 cột).

---

## 🚀 Cách chạy dự án
Mở file `index.html` trực tiếp trên trình duyệt, hoặc chạy bằng Python:
```bash
python -m http.server 8080
```
Sau đó truy cập: `http://localhost:8080/`
