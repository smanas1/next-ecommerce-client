# Troubleshooting: Cookies Not Sent on /listing Page in Production

## Problem Description

After login and redirect to home page (/), navigation to /listing page shows that cookies are not being sent, causing authentication to fail. This issue occurs in production but works locally.

## Root Causes

The most likely causes for this issue in production are:

1. **Different domains/subdomains between frontend and backend**
2. **CORS configuration issues**
3. **Secure cookies not working properly over HTTP in production**
4. **SameSite cookie attribute configuration**
5. **Domain-specific cookie settings**

## Solutions to Check

### 1. Verify Environment Configuration

Make sure these environment variables are properly set in production:

```
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com (or same domain)
```

### 2. Server-Side Cookie Configuration

The server needs to properly configure cookies for production. In your server's authentication endpoints, ensure cookies are set with:

```javascript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Important for cross-origin
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
  // domain: '.yourdomain.com' if needed for subdomain access
};
```

### 3. SameSite Attribute for Production

For production environments where frontend and backend might be on different subdomains:

- If same domain: `sameSite: 'lax'`
- If different subdomains (e.g., app.domain.com and api.domain.com): `sameSite: 'none'` AND `secure: true`
- If completely different domains: Requires proper CORS configuration

### 4. Check API Route Requests

Verify that all API calls include credentials. The client changes I've made include:

- Axios defaults with `withCredentials: true`
- All fetch requests with `credentials: 'include'`
- Response interceptors to handle auth failures

### 5. Browser Security Policies

Modern browsers have stricter cookie policies in production. Verify:

- Production site is served over HTTPS (required for `secure: true` cookies)
- No mixed content issues
- Browser isn't blocking third-party cookies

## Debugging Steps

### 1. Browser Developer Tools

1. Navigate to your production site
2. Go to Application/Storage tab
3. Check cookies are set after login
4. Navigate to /listing page
5. Verify cookies are still present
6. Go to Network tab and check requests to /listing
7. Verify cookies are included in request headers

### 2. Check API Responses

1. On login, verify Set-Cookie headers are properly sent
2. Check if any errors occur during the redirect process
3. Verify CORS headers are present and correct

### 3. Console Errors

Check browser console for any:
- CORS errors
- Cookie-related security errors
- Mixed content warnings

## Implementation Checklist

- [ ] Server sets cookies with correct domain/path
- [ ] Server includes proper CORS headers allowing credentials
- [ ] Production uses HTTPS for secure cookies
- [ ] SameSite attribute is configured correctly for your domain setup
- [ ] Client sends credentials with all requests
- [ ] Environment variables are correct in production

## If Issue Persists

If the problem continues:

1. Check your server framework's session/cookie configuration
2. Verify your reverse proxy (if using nginx, Apache, etc.) is not stripping cookies
3. Check if deployment platform (Vercel, Netlify, etc.) has specific requirements
4. Consider using JWT tokens in Authorization header instead of cookies if cookie issues persist