# 22 Southwest Transit Display

A real-time transit information display for the building lobby at 22 Southwest St, Mount Vernon, NY. Shows Metro-North train departures from Mount Vernon West station, nearby bus arrivals, and building notices.

## Features

- **Train Departures**: Real-time Metro-North train schedule for Mount Vernon West station
- **Bus Arrivals**: Nearby bus stop arrivals using MTA Bus Time API
- **Building Notices**: Customizable announcements with admin panel
- **TV-Optimized**: Dark theme, large fonts, auto-refresh - perfect for lobby displays

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (for notices)
- **Hosting**: Vercel
- **APIs**: MTA Bus Time API, Right Track API (Metro-North)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
# MTA Bus Time API Key (you already have this)
MTA_BUS_API_KEY=your_mta_bus_api_key

# Supabase (optional - demo notices will show without it)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin password for notices panel
ADMIN_PASSWORD=choose_a_secure_password

# Location coordinates
LOCATION_LAT=40.9126
LOCATION_LON=-73.8371
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the display.

## Setting Up Supabase (Optional)

For the notices feature to persist:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run this SQL in the SQL Editor:

```sql
CREATE TABLE notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON notices FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON notices FOR ALL USING (true);
```

4. Copy your project URL and anon key to `.env.local`

## Deploying to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Admin Panel

Access the admin panel at `/admin` to manage building notices.

Default password: `admin123` (change this in production!)

## Display Setup

For a TV/monitor display:
1. Deploy to Vercel
2. Open the URL on the display device
3. Use the browser's kiosk mode (F11 for fullscreen)
4. Optional: Set up auto-refresh with a browser extension

## API Endpoints

- `GET /api/trains` - Metro-North departures
- `GET /api/buses` - Nearby bus arrivals
- `GET /api/notices` - Active building notices
- `POST /api/notices` - Create notice (requires password)
- `DELETE /api/notices/[id]` - Delete notice (requires password)

## License

MIT

