# Authentication Setup - NextAuth.js v4

This document describes the authentication system for the ShennaStudio admin panel using NextAuth.js v4 with Prisma adapter.

## Overview

The authentication system provides:
- Secure email/password login for admin and staff users
- Session management with JWT strategy
- Role-based access control (ADMIN and STAFF only)
- Protected routes with middleware
- Automatic session handling

## Architecture

### Components

1. **NextAuth Configuration** (`src/lib/auth.ts`)
   - Credentials provider for email/password authentication
   - Prisma adapter for database integration
   - JWT session strategy
   - Custom callbacks for role management

2. **API Routes** (`src/app/api/auth/[...nextauth]/route.ts`)
   - NextAuth.js API handler
   - Handles authentication endpoints

3. **Middleware** (`src/middleware.ts`)
   - Protects `/admin/*` routes
   - Redirects unauthenticated users to login
   - Verifies user role (ADMIN or STAFF only)

4. **Login Page** (`src/app/admin/login/page.tsx`)
   - Client-side login form
   - Error handling
   - Redirect on success

5. **Admin Layout** (`src/app/admin/layout.tsx`)
   - Session-aware navigation
   - User information display
   - Logout functionality

### Database Schema

The Prisma schema includes NextAuth required models:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          UserRole  @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  orders        Order[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Environment Variables

Required environment variables in `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

For production, generate a secure secret:
```bash
openssl rand -base64 32
```

## Usage

### Default Admin Credentials

```
Email: admin@shennastudio.com
Password: admin123
```

**IMPORTANT**: Change this password in production!

### Accessing the Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Enter credentials
3. You'll be redirected to `http://localhost:3000/admin`

### Server-Side Session Access

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function MyPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  // Access user data
  console.log(session.user.email)
  console.log(session.user.role)

  return <div>Hello {session.user.name}</div>
}
```

### Client-Side Session Access

```typescript
'use client'

import { useSession } from '@/hooks/useSession'
import { signOut } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <p>Hello {session.user.email}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

### Logout

```typescript
import { signOut } from 'next-auth/react'

// Redirect to login after logout
signOut({ callbackUrl: '/admin/login' })

// Or without redirect
signOut({ redirect: false })
```

## Protected Routes

All routes under `/admin/*` are protected by middleware, except `/admin/login`.

The middleware:
1. Checks for valid session
2. Verifies user role (ADMIN or STAFF)
3. Redirects to login if unauthenticated
4. Redirects to login if user doesn't have required role

## Role-Based Access

The system supports three roles defined in `UserRole` enum:
- `ADMIN` - Full access to admin panel
- `STAFF` - Full access to admin panel
- `CUSTOMER` - No access to admin panel

Only users with `ADMIN` or `STAFF` role can:
- Login to the admin panel
- Access protected admin routes

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 rounds
2. **JWT Sessions**: Secure token-based sessions
3. **Role Verification**: Both in authorize callback and middleware
4. **CSRF Protection**: Built into NextAuth.js
5. **Secure Cookies**: HTTP-only cookies in production

## Testing

Run the authentication test script:

```bash
npx tsx scripts/test-auth.ts
```

This verifies:
- Admin user exists in database
- Password hash is valid
- NextAuth tables are created
- Environment variables are set

## Troubleshooting

### "Invalid credentials" error
- Verify the email and password are correct
- Check that the user exists in the database
- Ensure the password hash is valid

### Middleware redirect loop
- Check NEXTAUTH_URL is set correctly
- Verify NEXTAUTH_SECRET is set
- Check that the session callback returns user data

### Session not persisting
- Clear browser cookies
- Check that NEXTAUTH_SECRET is consistent
- Verify database connection

### TypeScript errors
- Run `npx prisma generate` to regenerate types
- Check that `src/types/next-auth.d.ts` exists

## Production Deployment

Before deploying to production:

1. **Change Default Password**
   ```typescript
   // In Prisma Studio or via script
   const hashedPassword = await bcrypt.hash('new-secure-password', 10)
   await prisma.user.update({
     where: { email: 'admin@shennastudio.com' },
     data: { password: hashedPassword }
   })
   ```

2. **Set Secure Environment Variables**
   ```env
   NEXTAUTH_SECRET=<generated-secret>
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Enable HTTPS**
   - NextAuth requires HTTPS in production
   - Configure your hosting platform accordingly

4. **Database Security**
   - Use connection pooling
   - Enable SSL for database connections
   - Restrict database access by IP

## Files Created

### Core Files
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - API handler
- `src/middleware.ts` - Route protection
- `src/types/next-auth.d.ts` - TypeScript definitions

### UI Components
- `src/app/admin/login/page.tsx` - Login page
- `src/app/admin/page.tsx` - Dashboard (protected)
- `src/app/admin/layout.tsx` - Admin layout
- `src/components/admin/LogoutButton.tsx` - Logout component
- `src/components/admin/UserNav.tsx` - User navigation
- `src/components/providers/SessionProvider.tsx` - Session provider wrapper
- `src/hooks/useSession.ts` - Session hook

### Database
- `prisma/schema.prisma` - Updated with NextAuth models
- Database tables: users, accounts, sessions, verification_tokens

### Testing
- `scripts/test-auth.ts` - Authentication test script

## Next Steps

1. Add password reset functionality
2. Implement email verification
3. Add two-factor authentication
4. Create user management interface
5. Add activity logging
6. Implement session timeout warnings
