# Fix Google Authentication Error

## Problem
"Invalid Google token" error when trying to sign in with Google. This was working before but stopped.

## Root Cause Analysis

The error occurs because:
1. **Server needs restart** - The `.env` file is loaded when the server starts. If you added/changed `GOOGLE_CLIENT_ID` after the server started, it won't be loaded.
2. **Client ID mismatch** - Frontend and backend must use the **exact same** Google Client ID.

## Solution Steps

### Step 1: Verify Client IDs Match

**Frontend** (`client/src/components/GoogleSignInButton.js`):
- Uses: `81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com` (fallback)

**Backend** (`server/.env`):
- Should have: `GOOGLE_CLIENT_ID=81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com`

✅ **Both are already matching!**

### Step 2: Restart Your Server

**This is the most common fix!**

1. **Stop the server** (Press `Ctrl+C` in the terminal where it's running)
2. **Restart it**:
   ```bash
   cd server
   npm start
   ```

3. **Look for this message** when the server starts:
   ```
   ✅ Google OAuth client initialized with Client ID: 81993856729-4igd8h...
   ```

If you DON'T see this message, the `.env` file isn't being loaded properly.

### Step 3: Check Server Console Logs

When you try to sign in, watch the server console. You should see:
```
[Google Auth] Request received
[Google Auth] Has idToken: true
[Google Auth] Token length: 1194
[Google Auth] Verifying token with Client ID: 81993856729-4igd8h...
[Google Auth] Full Client ID: 81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com
```

If you see an error, it will show the exact reason.

### Step 4: Clear Browser Cache

Sometimes cached tokens cause issues:
1. Open an **Incognito/Private window**
2. Try signing in again
3. Or clear your browser cache

## Common Issues & Fixes

### Issue: "GOOGLE_CLIENT_ID not configured"
**Fix**: 
- Check `server/.env` file exists
- Verify `GOOGLE_CLIENT_ID` is set (no spaces around `=`)
- Restart server

### Issue: "Client ID mismatch"
**Fix**:
- Ensure frontend and backend use the **exact same** Client ID
- Check for typos or extra spaces

### Issue: "Token expired"
**Fix**:
- This is temporary. Just try signing in again.

### Issue: Server console shows no Google Client ID
**Fix**:
- The `.env` file might not be in the `server/` directory
- Check the file path: `server/.env` (not `server/env` or `server.env`)
- Ensure `require('dotenv').config()` is called in `server/index.js` (it is, on line 11)

## Verification

After restarting the server, check:

1. **Server starts without errors**
2. **Console shows**: `✅ Google OAuth client initialized...`
3. **Try signing in** - should work now!

## Still Not Working?

Check the server console logs when you try to sign in. The improved error handling will show:
- Exact error message from Google
- Whether Client ID is configured
- Token verification details

Share the server console output for further debugging.

