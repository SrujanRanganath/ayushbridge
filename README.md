# AyushBridge

A full-stack application bridging AYUSH (Ayurveda, Yoga, Unani, Siddha, Homeopathy) with modern healthcare data and APIs.

## Project Structure

```
/ayushbridge
  /client          React 18 + TypeScript + Tailwind CSS + Vite
  /server          Node.js + Express.js + TypeScript + ESModules
  /data            CSV files for data ingestion
  .gitignore
  README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB (local or Atlas)

### Server Setup

```bash
cd server
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

See `server/.env.example` for required environment variables.

## API Endpoints

| Method | Route        | Description       |
|--------|--------------|-------------------|
| GET    | /api/health  | Health check      |

## Tech Stack

**Client:** React 18, TypeScript, Tailwind CSS, Vite, Axios, React Router DOM

**Server:** Node.js, Express.js, TypeScript, ESModules, Mongoose, JWT, Zod, Helmet, CORS, Rate Limiting

## License

MIT
