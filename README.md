# Professional Networking Contact Manager

A comprehensive contact management system for professional networking that enables intelligent contact tracking with advanced data parsing and normalization capabilities.

## Features

- Contact Management with role and company tracking
- Conversation note tracking with automatic title generation
- Document parsing for conversation records
- Meeting date tracking and reminder system
- Contact information standardization
- Sortable contact list view
- Edit capabilities for contact information and conversation details

## Tech Stack

- React frontend with TypeScript
- Express backend
- Drizzle ORM
- PostgreSQL database
- OpenAI integration for conversation insights
- Document parsing with mammoth.js
- Styled with shadcn/ui and Tailwind CSS

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL database connection string
- `OPENAI_API_KEY`: OpenAI API key for conversation analysis

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5000.

## Database Management

The project uses Drizzle ORM for database management. To update the database schema:

```bash
npm run db:push
```

## License

MIT
