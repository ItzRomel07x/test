# Simple Auth App

A simple authentication and product management system using SQLite database and file-based user authentication.

## Features

- File-based user authentication (userauth.json)
- SQLite database for data storage
- Product management
- Announcements system
- Simple admin interface

## Project Structure

```
├── client/                 # React frontend
├── server/                 # Express backend
├── database/              # SQLite database files (auto-generated)
├── userauth.json          # User authentication data
└── shared/                # Shared types and schemas
```

## How to Deploy on Replit

### Step 1: Fork the Project
1. Open [Replit](https://replit.com)
2. Create a new Repl and import this project from GitHub

### Step 2: Install Dependencies
The dependencies will be automatically installed when you run the project.

### Step 3: Configure the Run Button
Create or update your `.replit` file:

```toml
run = "npm run dev"

[env]
NODE_ENV = "development"

[[ports]]
localPort = 5000
externalPort = 80
```

### Step 4: Start the Application
1. Click the "Run" button in Replit
2. The app will start on port 5000
3. Access your app through the Replit preview URL

### Step 5: Access the Application
- Default users are loaded from `userauth.json`
- Login with any of the predefined users:
  - Username: `asif`, Password: `1`
  - Username: `Itz Romel`, Password: `1`
  - Username: `Villen`, Password: `1`

## Database

The application uses SQLite database which is automatically created in the `database/` folder when the app starts. The database includes:

- **users** table: User authentication data
- **products** table: Product catalog
- **announcements** table: System announcements

## User Authentication

Users are initially loaded from `userauth.json` file. The format is:

```json
[
  {
    "uid": "N/A",
    "username": "asif",
    "email": "N/A",
    "password": "1"
  }
]
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure

- `userauth.json` - User authentication data
- `database/` - SQLite database files (auto-generated)
- `server/` - Backend API and authentication
- `client/` - React frontend application
- `shared/` - Shared TypeScript types

## Notes

- The database is automatically initialized on first run
- Users from `userauth.json` are loaded into the database if it's empty
- The SQLite database files are created in the `database/` folder
- All data persists in the SQLite database after the initial load

## Deploying to Vercel

1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your forked repository
4. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
5. Add environment variables if needed in the Vercel dashboard
6. Deploy!

### Alternative CLI Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Build the project: `npm run build`
4. Deploy: `vercel --prod`

### Important Notes for Vercel

- The app uses SQLite database which works in development but Vercel's serverless functions are stateless
- For production, consider using a cloud database like PostgreSQL or MongoDB
- The `userauth.json` file will be reset on each deployment
- Consider using Vercel's environment variables for sensitive data