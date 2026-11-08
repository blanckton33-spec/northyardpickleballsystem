# 🏓 North Yard Pickleball Stacking & Queue System (React + Vite)

A modern, high-performance, fluid recreation of the **North Yard Pickleball System** built with **React**, **Vite**, and **Lucide Icons**, designed for instant zero-lag deployment to **GitHub** and **Vercel**.

---

## ✨ Features Recreated Exactly

1. **Open Play & Paddle Stacking**:
   - **4-Hour Running Timer**: Starts immediately when a player registers. Continuous countdown with zero screen flicker.
   - **Automatic Player Expiration**: When 4 hours expire, the player is automatically removed from active courts and queues, but **retained in the Registered Players list** with an `Expired` badge and a one-click `Re-Register` button (+4 hours).
   - **Games Played Stats**: Tracks match counts per player across the session, reflected in the player table, court cards, queue cards, and live display.
   - **Court Assignment**: Fixed Courts 1, 2, and 3 with 15-minute round countdown timers (Start, Pause, Reset).
   - **End Match (No Popup Dialog)**:
     - Automatically picks random winners and logs the match result.
     - Increments games played count for all 4 players.
     - **2-and-2 Queue Splitting & Randomization**:
       - Segregates Novices with Novices, Beginners with Beginners.
       - Fills existing waiting queues first up to 4/4 capacity.
       - Splits remaining players 2-and-2 into separate queues so players do not replay the same group consecutively.
   - **Draggable Queue Cards**: Drag Queue 1 to Queue 3 or Queue 2 to Queue 4 to reorder stacks with smooth HTML5 drag-and-drop.
   - **Send to Court**: Quick `Court 1`, `Court 2`, `Court 3` buttons on each queue card to seat players immediately.

2. **Public Mobile & TV Live Display (`/display`)**:
   - Dark green stadium theme (`#071b15` with radial green/blue glows).
   - Live pulsating green indicator and live clock.
   - **Smooth Name Search**: Players on smartphones can search and select their name without screen flickering.
   - **Personal Player Status Card**: Displays their personal 4-hour countdown, current court/queue position, and games played.
   - Live Courts 1, 2, 3 countdowns and waiting queues.

3. **Court Rentals**:
   - Book courts with customer info, hourly court rate, person rate, date, duration, and automatic total price calculation.
   - Filter by date, search, and manage statuses (Booked, Ongoing, Completed, Canceled).

4. **Paddle & Ball Rentals**:
   - Track rented paddles and balls, rates, and return times.

5. **Reports & Analytics**:
   - Registration logbook with Payment Status toggle (Paid / Unpaid) and fee tracking.
   - Match results history.
   - Revenue breakdown (Open Play fees + Court rentals + Equipment rentals).

6. **Instant Cross-Tab & Device Sync**:
   - Built with `BroadcastChannel` and `localStorage`: any change made in Admin immediately updates the Live Display tab in real-time without refreshing!

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Visit:
- **Admin Dashboard**: `http://localhost:5173/`
- **Public TV / Phone Live Display**: `http://localhost:5173/display`

---

## 🌐 Deploying to Vercel (Step-by-Step)

### Option A: Via GitHub (Recommended)
1. Create a new repository on your GitHub account (e.g. `pickleball-system`).
2. Run these commands inside this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/pickleball-system.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
4. Import your GitHub repository `pickleball-system`.
5. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**! Your app is live with global edge caching in ~30 seconds.

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 📁 Project Structure

```
├── public/                 # North Yard logo assets & favicons
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx     # Navigation menu & dark mode toggle
│   │   ├── Topbar.jsx      # Top header, live clock, profile
│   │   └── Toast.jsx       # Floating notifications
│   ├── context/
│   │   └── AppContext.jsx  # Reactive state, 4h ticker, 2-and-2 match split logic
│   ├── pages/
│   │   ├── OpenPlay.jsx    # Admin open play & draggable queue stacking
│   │   ├── LiveDisplay.jsx # Mobile/TV live court & queue display (/display)
│   │   ├── CourtRentals.jsx# Court booking system
│   │   ├── PaddleRentals.jsx# Paddle & ball rentals
│   │   ├── Reports.jsx     # Logbook, match history & revenue
│   │   └── Login.jsx       # North Yard login screen
│   ├── App.jsx             # Main router & tab switcher
│   ├── index.css           # Custom styles, animations, dark mode
│   └── main.jsx            # React root entry
├── index.html              # HTML shell with Google fonts
├── package.json            # Scripts & dependencies
├── vercel.json             # Vercel SPA routing rewrites
└── vite.config.js          # Vite config
```
