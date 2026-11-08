# TinyWeb – Frontend

The frontend application for **TinyWeb**, a small web browser built with Next.js, React, and TypeScript.

It provides a browser-like interface for navigating websites stored in MongoDB through the NestJS backend.

## Technology Stack

- **Framework:** Next.js
- **Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API Communication:** Fetch API

## Features

- Browser-style address bar for navigating custom `.zz` addresses.
- Navigate between websites using internal links.
- Back and Forward navigation.
- Restore scroll positions when revisiting pages.
- Person selection for separate browsing histories.
- Scrollable browsing history with jump-to-visit functionality.
- Search websites by their content.
- Preserve search results while navigating.
- Publish custom HTML pages.
- Display unavailable pages for nonexistent addresses.
- Render published HTML inside a sandboxed iframe.

## Project Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the frontend root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

This variable specifies the URL of the NestJS backend API.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open the application:

`http://localhost:3000`

Keep the backend running separately at `http://localhost:3001`.

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Run production server
npm run start

# Lint the project
npm run lint
```

## Application Structure

```text
src/
├── app/
├── components/
│   └── browser/
│       └── Browser.tsx
├── lib/
│   └── api.ts
└── types/
    └── index.ts
```

## Backend Integration

The frontend communicates with the NestJS REST API to:

- Retrieve browsing people and websites.
- Load website content by address.
- Record browsing visits.
- Retrieve individual browsing histories.
- Search website content.
- Publish new websites.

## Running the Complete Application

1. Start the NestJS backend.
2. Start the Next.js frontend in a separate terminal.
3. Open `http://localhost:3000` in your browser.

Refer to the root project README for complete setup and database seeding instructions.

## License

This project was developed as a technical assessment for the Full Stack Developer position at Wyxan.