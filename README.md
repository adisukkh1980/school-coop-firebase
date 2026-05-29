# ระบบร้านค้าสหกรณ์โรงเรียนบ้านโสน

โครงระบบใหม่สำหรับย้ายจาก Google Apps Script Web App ไปเป็น HTML + CSS + JavaScript + Firebase โดยตรง

## สถานะชุดที่ 1

ชุดนี้ทำเฉพาะโครงหน้าจอเริ่มต้นจาก UI เดิม:

- หน้าเข้าสู่ระบบ
- Sidebar
- Header
- เมนูตามสิทธิ์ผู้ใช้งาน
- หน้า Dashboard โครงเปล่า
- Logout
- Firebase Config แบบ placeholder

ยังไม่ทำระบบขายสินค้า POS จริง ยังไม่เชื่อมฐานข้อมูลเต็มระบบ และไม่ใช้ Google Apps Script, `google.script.run` หรือ Google Sheets

## ไฟล์หลัก

- `index.html` โครงหน้าเว็บ
- `css/style.css` รูปแบบหน้าจอและ Responsive
- `js/firebase-config.js` จุดใส่ค่า Firebase Config
- `js/auth.js` ระบบเข้าสู่ระบบจำลองสำหรับชุดที่ 1
- `js/app.js` การแสดงเมนู Header Sidebar Dashboard และ Logout

## วิธีใส่ Firebase Config

1. เข้า Firebase Console
2. เลือกโปรเจกต์ของโรงเรียน
3. ไปที่ Project settings
4. เพิ่ม Web app หรือเลือก Web app ที่มีอยู่
5. คัดลอกค่า config มาใส่ใน `js/firebase-config.js`

ตัวอย่างตำแหน่งที่ต้องเปลี่ยน:

```js
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

เมื่อใส่ค่าจริงแล้ว ระบบจะพร้อมสำหรับต่อยอด Firebase Auth, Firestore หรือบริการอื่นในชุดถัดไป

## บัญชีทดสอบในชุดที่ 1

ระบบยังใช้บัญชีจำลองเพื่อทดสอบ UI และ Role Menu:

| สิทธิ์ | ชื่อผู้ใช้งาน | รหัสผ่าน |
| --- | --- | --- |
| ผู้ดูแลระบบ | `admin` | `123456` |
| ครูผู้ดูแล | `teacher` | `123456` |
| พนักงานขาย | `cashier` | `123456` |
| สมาชิก | `member` | `123456` |

## สิทธิ์เมนู

- `admin` เห็นทุกเมนู
- `teacher` เห็น ภาพรวมร้านค้า, ขายสินค้า, จัดการสินค้า, รับสินค้าเข้าสต็อก, จัดการสมาชิก, ปันผลเฉลี่ยคืนสมาชิก, รายงานยอดขาย
- `cashier` เห็น ภาพรวมร้านค้า, ขายสินค้า
- `member` เตรียมไว้สำหรับอนาคต

## วิธีทดสอบ

เปิด `index.html` ในเบราว์เซอร์ หรือรันผ่าน local server แล้วเข้าสู่ระบบด้วยบัญชีทดสอบด้านบน

สิ่งที่ควรตรวจ:

- หน้า Login แสดงโทนสีและการ์ดเหมือนระบบเดิม
- เข้าสู่ระบบด้วยแต่ละ role แล้วเมนูแสดงตามสิทธิ์
- ปุ่มเมนูเปิดหน้าโครงเปล่าได้
- ปุ่มออกจากระบบกลับไปหน้า Login
- บนจอมือถือ Sidebar เปิดปิดได้
