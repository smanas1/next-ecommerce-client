# Production Authentication Cookie Configuration Guide

## Client-Side Configuration

Most of the necessary fixes have been implemented in the client-side code:

- Auth state synchronization on app initialization
- Proper credentials handling for all requests
- Response interceptors for 401 handling
- Custom hooks for auth state management

## Server-Side Cookie Configuration (Server Project)

The following configuration is likely needed in your server project (which should be in a separate directory) to properly handle cookies in production:

### 1. Cookie Settings in Express/Server Framework:

```javascript
// In your server's cookie/session configuration
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Important for cookies
  })
);

// Cookie options for production
const cookieOptions = {
  httpOnly: true,      // Prevent XSS attacks
  secure: process.env.NODE_ENV === 'production',  // Only send over HTTPS in production
  sameSite: 'lax',     // Good balance for CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',           // Cookie path
};
```

### 2. Login/Registration Response:

When setting the access token cookies in your auth controller, ensure they include appropriate options:

```javascript
// In your login endpoint
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'lax', // or 'none' if on different subdomains
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  domain: process.env.COOKIE_DOMAIN || undefined, // Set if needed for cross-subdomain
});
```

### 3. Environment Variables for Production

Make sure these environment variables are set in production:

- `NEXT_PUBLIC_FRONTEND_URL`: Your production frontend URL
- `NEXT_PUBLIC_API_BASE_URL`: Your production API URL
- `NODE_ENV`: Should be 'production'
- `JWT_SECRET`: Your JWT secret
- `COOKIE_DOMAIN`: (Optional) If you need cross-subdomain cookies

### 4. SameSite Cookie Attribute

In production, especially if your frontend and backend are on different domains/subdomains, you might need to adjust the SameSite attribute:

- If frontend and backend are on the same domain: `sameSite: 'lax'` is usually sufficient
- If on different subdomains: you might need `sameSite: 'none'` and `secure: true`
- If on completely different domains: requires CORS configuration

### 5. HTTPS Requirements

Cookies with `secure: true` will only be sent over HTTPS in production. Make sure your production environment serves over HTTPS.

## Troubleshooting Steps for Production

1. Check browser developer tools:
   - Network tab: Verify cookies are being sent with requests to /listing
   - Application/Storage tab: Check if cookies are properly stored
   - Console: Look for any CORS or security errors

2. Verify environment variables in production deployment

3. Check that the API_BASE_URL is correctly set in production

4. Ensure your production server allows credentials and sets cookies properly

## Additional Client-Side Configuration

The changes in this repository should already handle the client-side aspects properly. The main issue is likely in the server-side cookie configuration.