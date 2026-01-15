# Hướng Dẫn Cài Đặt/Test Ứng Dụng Trên iPhone (Dành cho Windows)

Do bạn đang sử dụng hệ điều hành **Windows**, bạn sẽ gặp hạn chế lớn khi phát triển ứng dụng iOS native:
> **Lưu ý quan trọng:** Để build và cài đặt file ứng dụng gốc (`.ipa`) trực tiếp lên iPhone, Apple **bắt buộc** phải sử dụng phần mềm **Xcode**, và Xcode chỉ chạy trên máy **Mac (macOS)**.

Tuy nhiên, bạn vẫn có 3 cách để cài đặt hoặc test ứng dụng trên iPhone của mình từ Windows:

## Cách 1: Cài đặt dạng PWA (Khuyên Dùng)
Dự án của bạn đã được tích hợp sẵn cấu trúc **Progressive Web App (PWA)** (thông qua `vite-plugin-pwa`). Đây là cách nhanh nhất để có biểu tượng ứng dụng trên màn hình chính mà không cần App Store.

**Các bước thực hiện:**

1.  **Build ứng dụng:**
    Chạy lệnh sau trong terminal của dự án:
    ```bash
    npm run build
    ```
    Lệnh này sẽ tạo ra thư mục `dist` chứa mã nguồn web đã được tối ưu.

2.  **Deploy (Đưa lên mạng):**
    Bạn cần upload thư mục `dist` lên một dịch vụ hosting miễn phí như **Vercel**, **Netlify**, hoặc **Surge**.
    *   *Ví dụ với Netlify Drop:* Chỉ cần kéo thả thư mục `dist` vào trang chủ Netlify Drop.

3.  **Cài trên iPhone:**
    *   Mở trình duyệt **Safari** trên iPhone.
    *   Truy cập vào đường link trang web bạn vừa deploy.
    *   Nhấn vào nút **Chia sẻ** (biểu tượng hình vuông có mũi tên đi lên).
    *   Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
    *   Nhấn **Thêm**.

Lúc này, ứng dụng sẽ xuất hiện trên màn hình iPhone như một app bình thường (ẩn thanh địa chỉ, chạy full màn hình).

---

## Cách 2: Test qua mạng LAN (Dùng trong lúc lập trình)
Nếu bạn chỉ muốn xem thử ứng dụng trên iPhone trong lúc đang code (chưa cần cài đặt vĩnh viễn):

1.  Đảm bảo iPhone và máy tính Windows của bạn đang kết nối **cùng một mạng Wi-Fi**.
2.  Chạy lệnh sau trên máy tính:
    ```bash
    npm run dev -- --host
    ```
    *(Tham số `--host` cho phép truy cập từ thiết bị khác trong mạng)*
3.  Terminal sẽ hiện ra địa chỉ IP, ví dụ: `http://192.168.1.15:3000`.
4.  Mở Safari trên iPhone và nhập địa chỉ đó vào.

---

## Cách 3: Build bản Native (.ipa) - Cần máy tính Mac
Nếu bạn bắt buộc phải cài bản native (để dùng các tính năng phần cứng sâu hơn mà PWA không hỗ trợ), bạn cần **mượn một máy Mac** hoặc sử dụng dịch vụ thuê máy Mac từ xa.

**Quy trình nếu có máy Mac:**
1.  Copy toàn bộ source code sang máy Mac.
2.  Chạy lệnh để đồng bộ:
    ```bash
    npm install
    npm run build
    npx cap sync ios
    ```
3.  Mở file dự án iOS:
    ```bash
    npx cap open ios
    ```
    (Xcode sẽ mở ra).
4.  Cắm iPhone vào máy Mac qua cáp USB.
5.  Trong Xcode, đăng nhập Apple ID (miễn phí) vào phần **Settings > Accounts**.
6.  Chọn Team là "Personal Team" của bạn trong phần **Signing & Capabilities**.
7.  Nhấn nút **Run** (hình tam giác) để cài app thẳng vào iPhone.
    *(App sẽ tồn tại trong 7 ngày, sau đó cần cài lại)*.

---

## Tóm lại
Với người dùng Windows không có máy Mac, **Cách 1 (PWA)** là giải pháp tối ưu nhất để "tự dùng" ứng dụng trên iPhone.
