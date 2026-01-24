# NextAuth.js Authentication - Quick Start

## Test the Authentication

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Run the Authentication Tests
```bash
npx tsx scripts/test-auth.ts
```

Expected output:
```
✅ All authentication tests passed!

📝 Test Credentials:
   Email: admin@shennastudio.com
   Password: admin123

🌐 Access Points:
   Login: http://localhost:3000/admin/login
   Dashboard: http://localhost:3000/admin
   API: http://localhost:3000/api/auth
```

### 3. Test the Login Flow

1. Open browser to http://localhost:3000/admin
2. You should be redirected to http://localhost:3000/admin/login
3. Enter credentials:
   - Email: `admin@shennastudio.com`
   - Password: `admin123`
4. Click "Sign in"
5. You should be redirected to http://localhost:3000/admin (dashboard)
6. Verify you can see:
   - Welcome message with your email
   - User role badge (ADMIN)
   - Navigation menu
   - Sign Out button

### 4. Test Protected Routes

1. Click "Sign Out" button
2. Try to access http://localhost:3000/admin directly
3. You should be redirected to login page
4. This confirms route protection is working

### 5. Test Role-Based Access

The system only allows ADMIN and STAFF roles to access the admin panel.

To test this, you would need to:
1. Create a customer user (role: CUSTOMER)
2. Try to log in with that user
3. You should see: "Unauthorized - Admin access required"

## File Locations

### Authentication Core
- **Configuration**: `/src/lib/auth.ts`
- **API Routes**: `/src/app/api/auth/[...nextauth]/route.ts`
- **Middleware**: `/src/middleware.ts`
- **Types**: `/src/types/next-auth.d.ts`

### UI Components
- **Login Page**: `/src/app/admin/login/page.tsx`
- **Dashboard**: `/src/app/admin/page.tsx`
- **Layout**: `/src/app/admin/layout.tsx`
- **Components**: `/src/components/admin/`

### Session Management
- **Provider**: `/src/components/providers/SessionProvider.tsx`
- **Hook**: `/src/hooks/useSession.ts`

## Common Commands

```bash
# Start dev server
npm run dev

# Run authentication tests
npx tsx scripts/test-auth.ts

# Open Prisma Studio to view database
npm run db:studio

# Re-seed admin user if needed
npm run db:seed

# Generate Prisma types
npx prisma generate

# Push schema changes
npm run db:push
```

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret
DATABASE_URL=postgresql://...
```

## Documentation

- **Complete Guide**: See `AUTHENTICATION.md`
- **Setup Summary**: See `AUTH_SETUP_SUMMARY.md`
- **Test Script**: `scripts/test-auth.ts`

## Troubleshooting

### Can't login
- Verify database is running
- Check admin user exists: `npm run db:studio`
- Verify credentials are correct
- Check server console for errors

### Redirected back to login
- Clear browser cookies
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches dev server

### TypeScript errors
- Run `npx prisma generate`
- Restart TypeScript server in your IDE

## Production Notes

Before deploying:
1. Change the default admin password
2. Generate a secure NEXTAUTH_SECRET
3. Update NEXTAUTH_URL to production domain
4. Enable HTTPS
5. Review `AUTHENTICATION.md` production checklist

## Success Criteria

- ✅ Can access login page
- ✅ Can log in with test credentials
- ✅ Redirected to dashboard after login
- ✅ Can see user information
- ✅ Can log out
- ✅ Protected routes redirect to login when not authenticated
- ✅ All tests pass

**Status: READY TO USE**
