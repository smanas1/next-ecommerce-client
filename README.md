# Next Ecommerce — Client

A Next.js frontend for the Next Ecommerce project. Built with TypeScript and the app router. Provides UI, auth flow, and storefront pages that communicate with the backend API.

## Key Features
- Server-side and client-side rendering with Next App Router
- Authentication (cookies / JWT)
- Product listing, cart, checkout flows
- Admin / role-based pages
- Toast notifications and global layout

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Prisma (backend)
- Axios / fetch for API calls
- Zustand / context for client state (if used)
- Tailwind / custom CSS (project-specific)

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm or Yarn
- Backend server running (see server/ README)

## Install
Open a terminal in the client folder and run:
```bash
npm install
# or
yarn install
```

## Environment
Create a `.env.local` in the client root. Example variables:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ARCJET_KEY=your_arcjet_public_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXX
# Do NOT store server secrets (e.g. JWT_SECRET) in client env
```

## Scripts
- Start dev server:
```bash
npm run dev
# or
yarn dev
```
- Build for production:
```bash
npm run build
npm run start
```
- Lint:
```bash
npm run lint
```
- Test:
```bash
npm run test
```

## Running with Backend
Ensure the backend is running and CORS is configured to allow the client origin. If auth uses cookies, ensure:
- Backend sets cookies with sameSite and secure settings appropriate for environment
- Frontend requests include credentials (axios: withCredentials: true / fetch: credentials: 'include')

## Project Structure (high level)
- src/app — Next app routes and layouts
- src/components — Reusable UI components
- src/pages or src/app — Pages (app router)
- src/styles — Global styles
- public — Static assets

## Troubleshooting
- Login redirect issues: clear cookies, ensure backend sets cookies, confirm API base URL, and use router.refresh() after login if middleware depends on cookies.
- CORS errors: verify CLIENT_URL / NEXT_PUBLIC_API_BASE_URL and credentials settings on backend.
- Check browser DevTools Network and Console for failed requests and cookie headers.

## Contributing
- Follow existing code style and run lint/tests before PR
- Open issues with reproduction steps


