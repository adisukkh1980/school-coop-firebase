# ระบบร้านค้าสหกรณ์โรงเรียนบ้านโสน

โครงระบบใหม่สำหรับร้านค้าสหกรณ์โรงเรียน พัฒนาด้วย HTML, CSS, JavaScript และ Firebase โดยตรง

## สถานะชุดที่ 2

ชุดนี้เพิ่มระบบเข้าสู่ระบบด้วย Firebase Authentication แบบ Email/Password และอ่านสิทธิ์ผู้ใช้จาก Firestore collection `users`

สิ่งที่ทำแล้ว:

- หน้า Login ตาม UI เดิม
- Sidebar และ Header ตาม UI เดิม
- เมนูตามสิทธิ์ผู้ใช้งาน
- ดึงข้อมูลผู้ใช้จาก `users/{uid}` หลัง Login สำเร็จ
- ตรวจ `status` ต้องเป็น `active`
- อัปเดต `lastLogin` ทุกครั้งที่ Login สำเร็จ
- Logout แล้วกลับหน้า Login
- Firebase SDK แบบ Modular

ยังไม่ทำระบบขายสินค้า POS จริง และยังไม่เชื่อมข้อมูลสินค้า สมาชิก สต็อก รายงาน หรือปันผลเต็มระบบ

## ไฟล์หลัก

- `index.html` โครงหน้าเว็บ
- `css/style.css` รูปแบบหน้าจอและ Responsive
- `js/firebase-config.js` จุดใส่ค่า Firebase Config และเริ่ม Firebase app
- `js/auth.js` ระบบ Login, Logout, ตรวจผู้ใช้ และอ่านสิทธิ์จาก Firestore
- `js/app.js` การแสดงเมนู Header Sidebar Dashboard และหน้าโครงเปล่า

## วิธีใส่ Firebase Config

1. เข้า Firebase Console
2. เลือกโปรเจกต์ของโรงเรียน
3. ไปที่ Project settings
4. เพิ่ม Web app หรือเลือก Web app ที่มีอยู่
5. คัดลอกค่า config มาใส่ใน `js/firebase-config.js`

ตัวอย่างตำแหน่งที่ต้องเปลี่ยน:

```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## การตั้งค่า Firebase Authentication

1. เข้า Firebase Console
2. ไปที่ Authentication
3. เปิด Sign-in method
4. เปิดใช้งาน Email/Password
5. ไปที่ Users
6. เพิ่มผู้ใช้ด้วยอีเมลและรหัสผ่านที่ต้องการ

## การสร้าง user admin คนแรก

หลังสร้างบัญชีใน Authentication แล้ว ให้คัดลอก `uid` ของผู้ใช้คนนั้น จากนั้นสร้างเอกสารใน Firestore:

- Collection: `users`
- Document ID: ใช้ `uid` จาก Authentication

ตัวอย่างข้อมูลเอกสาร:

```js
{
  name: "ผู้ดูแลระบบ",
  email: "admin@example.com",
  role: "admin",
  status: "active",
  createdAt: new Date(),
  lastLogin: null
}
```

ค่าที่ระบบใช้:

- `name` ชื่อที่แสดงบน Header
- `email` อีเมลผู้ใช้
- `role` สิทธิ์ผู้ใช้ เช่น `admin`, `teacher`, `cashier`, `member`
- `status` ต้องเป็น `active` จึงเข้าใช้งานได้
- `lastLogin` ระบบจะอัปเดตให้อัตโนมัติหลัง Login สำเร็จ

## สิทธิ์เมนู

- `admin` เห็นทุกเมนู
- `teacher` เห็น ภาพรวมร้านค้า, ขายสินค้า, จัดการสินค้า, รับสินค้าเข้าสต็อก, จัดการสมาชิก, ปันผลเฉลี่ยคืนสมาชิก, รายงานยอดขาย
- `cashier` เห็น ภาพรวมร้านค้า, ขายสินค้า
- `member` เตรียมไว้สำหรับอนาคต

## วิธีทดสอบ Login

1. ใส่ค่า Firebase Config จริงใน `js/firebase-config.js`
2. เปิด Email/Password ใน Firebase Authentication
3. สร้างผู้ใช้ใน Authentication
4. สร้างเอกสาร `users/{uid}` ใน Firestore โดยให้ `status` เป็น `active`
5. เปิด `index.html` ผ่าน local server หรือ hosting
6. Login ด้วยอีเมลและรหัสผ่านที่สร้างไว้
7. ตรวจว่า Header แสดงชื่อและสิทธิ์ถูกต้อง
8. ตรวจว่าเมนูแสดงตาม `role`
9. กดออกจากระบบแล้วต้องกลับหน้า Login

ถ้า Login ผ่าน Authentication แล้ว แต่ไม่มีเอกสารใน `users/{uid}` ระบบจะแจ้งว่า `ไม่พบข้อมูลผู้ใช้ในระบบ`
