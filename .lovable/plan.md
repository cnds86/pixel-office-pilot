

## OpenClaw - Pixel Art Office Web App

แอป web สำหรับจัดการ OpenClaw project ในสไตล์ **Pixel Art Office** พร้อม mock data

### 🎨 Design Theme
- สี pixel art retro: พื้นหลังสีเข้ม, accent สีนีออน/พาสเทล
- ฟอนต์ pixel style (Press Start 2P หรือ VT323 จาก Google Fonts)
- UI elements มีกรอบแบบ pixel, ปุ่มสไตล์ 8-bit
- ไอคอน pixel art สำหรับ agents และ team members

### 📐 Layout
- **Sidebar** (pixel art style): เมนู Mission Control, Task Board พร้อมไอคอน pixel
- **Header**: ชื่อโปรเจกต์ "OpenClaw" + pixel art logo

### 🚀 Page 1: Mission Control
1. **Dashboard ภาพรวม**: สถิติ tasks, agents online, progress bars แบบ pixel
2. **Timeline/Roadmap**: แสดง milestones ในรูปแบบ horizontal timeline แบบ pixel
3. **Team & Agents Panel**: แสดงรายชื่อสมาชิก + agents หลายตัว พร้อมสถานะ (online/busy/offline) ในรูป pixel avatar
4. **Agent Activity Feed**: แสดง log ของ agents ที่ทำงานอยู่แบบ real-time look

### 📋 Page 2: Task Board (Kanban)
- 3 คอลัมน์: **To Do**, **In Progress**, **Done**
- การ์ดแต่ละใบแสดง: ชื่องาน, assigned agent/member, priority tag, pixel art badge
- สามารถเพิ่ม/แก้ไข/ลบ task ได้ (เก็บใน state)
- ลาก-วาง task ระหว่างคอลัมน์ (click-based move)
- ฟิลเตอร์ตาม agent หรือ priority

### 💾 Data
- ใช้ mock data + React state (ไม่มี backend)
- ข้อมูลจำลอง agents, team members, tasks, และ milestones

