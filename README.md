# TinyWeb – A Small Web Browser

TinyWeb is a full-stack web application that simulates a miniature web ecosystem. Users can browse websites hosted in a MongoDB database through custom `.zz` addresses, navigate between pages, maintain individual browsing histories, search website content, and publish their own HTML pages.

Built as a Full Stack Developer technical assessment for Wyxan.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| HTML Processing | Cheerio, sanitize-html |
| Communication | REST API |

## Key Features

### 1. Browse
- Navigate using custom `.zz` addresses.
- Follow internal links between websites.
- Display an appropriate not-found page for unavailable addresses.

### 2. Back and Forward Navigation
- Maintain browser navigation history.
- Support Back and Forward actions.
- Discard forward entries when navigating from an earlier point.
- Restore previous page scroll positions.

### 3. Browsing History
- Select a browsing person.
- Maintain separate histories for different people.
- View previous visits and navigate directly to a selected visit.

### 4. Content Search
- Search across website content rather than relying only on page titles.
- Use MongoDB text indexing to retrieve relevant websites.
- Return to previous search results after navigating to a page.

### 5. Publish
- Publish custom HTML pages using unique `.zz` addresses.
- Associate published pages with selected authors.
- Prevent duplicate addresses.
- Sanitize submitted HTML before storing and displaying it.

## Project Structure

```text
TinyWeb/
├── backend/
│   ├── src/
│   │   ├── people/
│   │   ├── sites/
│   │   ├── visits/
│   │   ├── search/
│   │   └── seed/
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   └── browser/
│   │   ├── lib/
│   │   └── types/
│   └── README.md
│
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or a compatible MongoDB instance

## Environment Configuration

### Backend

Create `backend/.env`:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Do not commit actual environment files or database credentials.

## Installation and Setup

### 1. Backend dependencies

```bash
cd backend
npm install
```

### 2. Frontend dependencies

Open another terminal from the project root:

```bash
cd frontend
npm install
```

## Database Seeding

From the backend directory:

```bash
npm run seed
```

The seed script populates the database with sample people, websites, authors, and browsing history. It is designed to be repeatable and idempotent.

## Running the Application

### Start the Backend

```bash
cd backend
npm run start:dev
```

Backend: `http://localhost:3001`

### Start the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`

Open `http://localhost:3000` in your browser.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/people` | Retrieve people |
| POST | `/api/people` | Create a person |
| GET | `/api/sites` | Retrieve websites |
| POST | `/api/sites` | Publish a website |
| GET | `/api/sites/:address` | Retrieve a website |
| GET | `/api/search?q=query` | Search website content |
| POST | `/api/visits` | Record a visit |
| GET | `/api/visits/:personId` | Retrieve browsing history |

## Design and Implementation Decisions

- **Data model:** People, sites, and visits are stored as separate MongoDB collections.
- **Navigation:** The frontend maintains a navigation stack with an active index and saved scroll positions.
- **History:** Visits are persisted through the backend and associated with individual people.
- **Search:** MongoDB text indexes support searching website titles and extracted page content.
- **HTML rendering:** Published HTML is sanitized and rendered in a sandboxed iframe to restrict untrusted content.

## Scope

The application focuses on the requested browser functionality. Authentication, user accounts, bookmarks, multiple tabs, extensions, downloads, hosted external assets, and real-world internet browsing are intentionally excluded.

## Assessment Deliverables

- Full-stack source code.
- Deterministic database seed script.
- Instructions for running both applications.
- Narrated screen recording demonstrating the required browser functionality.

## License

Developed as a technical assessment for Wyxan.