# Manehej Admin API

A secure admin authentication system for the Manehej platform built with Node.js, Express, TypeScript, and Prisma.

## Features

- 🔐 Secure admin authentication (login only, no registration)
- 👤 Admin profile management (view, update)
- 🔑 Password change functionality
- 🛡️ JWT-based session management
- 🔒 Role-based access control (ADMIN, SUPER_ADMIN)
- ⚡ Rate limiting for security
- 🗄️ PostgreSQL database with Prisma ORM
- 📝 Comprehensive input validation with Zod
- 🚨 Error handling and logging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (>=16.0.0)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd manehej-back
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Set a secure `JWT_SECRET`
   - Configure other settings as needed

4. Set up the database:

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed initial admin user
   npm run db:seed
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed initial admin user

## API Endpoints

### Authentication Routes (`/api/admin/auth`)

#### Public Routes

- `POST /login` - Admin login
  ```json
  {
    "email": "admin@manehej.com",
    "password": "your_password"
  }
  ```

#### Protected Routes (require authentication)

- `GET /profile` - Get admin profile
- `PUT /profile` - Update admin profile
- `PUT /change-password` - Change admin password
- `POST /logout` - Logout admin
- `POST /refresh-token` - Refresh JWT token
- `GET /me` - Get current admin info

### Health Check

- `GET /health` - API health status

## Default Admin Credentials

After running the seed script, you can login with:

- **Email**: admin@manehej.com
- **Password**: Admin123!@#

⚠️ **Important**: Change the default password after first login!

## Security Features

- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

- **Rate Limiting**:
  - Login attempts: 5 per 15 minutes
  - Password changes: 3 per hour
  - General API: 100 requests per 15 minutes

- **Session Management**:
  - JWT tokens with expiration
  - Session tracking in database
  - Automatic session cleanup
  - Device and IP tracking

## Database Schema

### Admin Model

- `id`: UUID primary key
- `name`: Admin full name
- `email`: Unique email address
- `password_hash`: Hashed password
- `role`: ADMIN or SUPER_ADMIN
- `is_active`: Account status
- `last_login`: Last login timestamp
- `created_at`: Account creation date
- `updated_at`: Last update date

### AdminSession Model

- `id`: UUID primary key
- `admin_id`: Reference to admin
- `token_hash`: Hashed JWT token
- `device_info`: User agent string
- `ip_address`: Client IP address
- `is_active`: Session status
- `expires_at`: Token expiration
- `created_at`: Session creation date
- `last_used_at`: Last activity timestamp

## Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The API will be available at `http://localhost:3001`

3. Use tools like Postman or curl to test the endpoints

## Production Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Deploy database migrations:

   ```bash
   npm run db:deploy
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test your changes thoroughly

## License

This project is proprietary software for the Manehej platform.
