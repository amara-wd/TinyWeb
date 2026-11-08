# TinyWeb – Backend

The backend service for **TinyWeb**, a small web browser application built with NestJS, TypeScript, and MongoDB.

It provides REST APIs for browsing websites, managing people, recording browsing history, searching website content, and publishing HTML pages.

## Technology Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Validation:** class-validator and class-transformer
- **HTML Processing:** Cheerio and sanitize-html

## Features

- Manage browsing people.
- Create and retrieve websites using custom `.zz` addresses.
- Search website content using MongoDB text indexes.
- Record browsing visits with timestamps and navigation methods.
- Retrieve person-specific browsing history.
- Publish user-submitted HTML pages.
- Validate website addresses and prevent duplicate addresses.
- Sanitize published HTML before storing and displaying it.
- Seed the database with deterministic sample data.

## Project Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the backend root directory:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

Replace the MongoDB URI with your own connection string.

## Database Seeding

Run the seed command to populate MongoDB with sample people, websites, authors, and browsing history.

```bash
npm run seed
```

The seed operation is designed to be repeatable and idempotent.

## Running the Application

```bash
# Development mode
npm run start

# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

The backend runs at:

`http://localhost:3001`

API base URL:

`http://localhost:3001/api`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/people` | Retrieve browsing people |
| POST | `/api/people` | Create a person |
| GET | `/api/sites` | Retrieve websites |
| POST | `/api/sites` | Publish a website |
| GET | `/api/sites/:address` | Retrieve a website by address |
| GET | `/api/search?q=query` | Search website content |
| POST | `/api/visits` | Record a browsing visit |
| GET | `/api/visits/:personId` | Retrieve a person's browsing history |

## Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Configuration

The `.env` file contains environment-specific configuration and should not be committed to version control.

Ensure that MongoDB is accessible before starting the backend.

## License

This project was developed as a technical assessment for the Full Stack Developer position at Wyxan.