# NUR Architects CMS

This repository contains the Next.js application for NUR Architects. It includes the public website, a CMS/admin area, MongoDB-backed content models, and API routes for both public and administrative use.

## Stack

- Next.js 16
- React 19
- TypeScript
- MUI
- Ant Design
- MongoDB with Mongoose

## Project Structure

- `src/app/` - App Router routes for the public site, admin area, and API endpoints
- `src/components/` - Shared UI components
- `src/lib/` - Database, content, SEO, validation, and utility helpers
- `src/models/` - Mongoose schemas and model registry
- `src/types/` - Shared TypeScript interfaces
- `public/` - Static assets such as fonts and fallback images

## Public Routes

- `/` - Homepage
- `/gioi-thieu` - About page
- `/du-an` - Project listing
- `/tin-tuc` - News listing
- `/lien-he` - Contact page
- `/hop-tac` - Collaboration page
- `/tuyen-dung` - Careers

## Homepage Data Flow

The homepage is rendered from the existing public API routes:

- `GET /api/homepage`
- `GET /api/projects`
- `GET /api/news`
- `GET /api/contact`

These routes are backed by the Mongoose models in `src/models/index.ts`.

## Setup

1. Install dependencies.
2. Configure environment variables in `.env`.
3. Run the development server.

## Scripts

- `npm run dev` - Start the local development server
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run the test suite

## Environment

The app expects MongoDB and related runtime settings defined in `.env`. Use `.env.example` as the baseline for local setup.

