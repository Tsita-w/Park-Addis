# 🚗 PARK-ADDIS  
Smart Parking Management System for Addis Ababa  

Park-Addis is a full-stack MERN application designed to solve the urban parking crisis. It connects drivers with available parking spots in real-time, simplifies payments via Chapa, and provides attendants with digital tools to manage vehicle entry/exit.

---

## 🌟 Key Features  

### 🔹 For Drivers  
- Real-time Map: Find the nearest parking lots using an interactive map  
- Instant Booking: Reserve a spot in seconds  
- Digital Pass: Generate a unique QR code for touchless entry  
- Chapa Integration: Secure mobile payments (Telebirr, CBE, etc.)  

### 🔹 For Attendants (Staff)  
- QR Scanner: Quickly check vehicles in and out  
- Live Occupancy: Monitor how many slots are left in the lot  
- Incident Reporting: Report damages or security issues directly to management  

### 🔹 For Admins  
- Revenue Analytics: View daily/monthly earnings  
- User Management: Oversee drivers and staff performance  
- Lot Management: Add or remove parking locations  

---

## 🛠️ Tech Stack  

| Technology      | Usage                                      |
|---------------|-------------------------------------------|
| MongoDB Atlas | Database for Users, Bookings, and Incidents |
| Express.js    | Backend API Framework                     |
| React.js      | Interactive Frontend UI                   |
| Node.js       | Server-side Environment                   |
| Tailwind CSS  | Modern, Responsive Styling                |
| Lucide React  | Premium Icon System                       |
| JWT           | Secure User Authentication                |

---

## 🚀 Getting Started  

### 1. Prerequisites  
- Node.js installed  
- MongoDB Atlas account  
- Chapa Merchant account (for payments)  

### 2. Installation  

#### Clone the repository  
```bash
git clone https://github.com/Tsita-w/park-addis.git
cd park-addis
```

#### Setup Backend  
- Navigate to `/server`  
- Run:
```bash
npm install
```

- Create a `.env` file and add:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CHAPA_SECRET_KEY=your_chapa_key
```

- Start server:
```bash
node server.js
```

#### Setup Frontend  
- Navigate to `/client`  
- Run:
```bash
npm install
```

- Start app:
```bash
npm start
```

---

## 🎨 Design Philosophy  
The UI follows a strict Yellow, Blue, and Gray color palette to ensure high visibility for drivers and a professional look for management.

---

## 👥 Authors  
**Tsion Wubshet**  
Software Engineering Student  
