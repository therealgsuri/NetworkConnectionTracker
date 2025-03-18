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

## Document Upload Requirements

When uploading conversation documents, the files must follow this naming convention:

```
YYYYMMDD - First Last.docx
```

### File Name Format Rules:
- Date must be in YYYYMMDD format (e.g., 20240317)
- A hyphen (-) or en dash (–) should separate the date and name
- Name should be in "First Last" format
- File must be a Word document (.doc or .docx)

### Examples of Valid File Names:
- `20240317 - John Smith.docx`
- `20240318 - Sarah Jones.docx`
- `20240319 – Alex Brown.docx`

### Common Issues to Avoid:
- Don't include extra spaces at the end of the name
- Don't include middle names or titles
- Don't use other date formats

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