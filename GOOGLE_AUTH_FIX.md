# Fixing "Invalid Google token" Error

## Problem
The error "Invalid Google token" appears when trying to sign in with Google. This happens when the Google Client ID on the backend doesn't match the one used on the frontend.

## Solution

### Step 1: Check Your Server `.env` File

Open `server/.env` and ensure you have:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Step 2: Get the Correct Google Client ID

The frontend is using this fallback Client ID:
```
81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com
```

**Option A: Use the same Client ID on the server**
1. Add this to your `server/.env` file:
   ```env
   GOOGLE_CLIENT_ID=81993856729-4igd8hkurq85l3gkg2ceim4j33rglh40.apps.googleusercontent.com
   ```

**Option B: Use your own Google Client ID**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add both Client IDs to:
   - `server/.env`: `GOOGLE_CLIENT_ID=your-client-id`
   - `client/.env`: `REACT_APP_GOOGLE_CLIENT_ID=your-client-id`

### Step 3: Restart Your Server

After updating the `.env` file:
```bash
# Stop your server (Ctrl+C)
# Then restart it
cd server
npm start
```

### Step 4: Verify the Fix

1. Clear your browser cache or use an incognito window
2. Try signing in with Google again
3. The error should be resolved

## Common Issues

### Issue: "Google Client ID mismatch"
**Solution**: Make sure the `GOOGLE_CLIENT_ID` in `server/.env` matches the one used on the frontend.

### Issue: "Google authentication is not configured"
**Solution**: The `GOOGLE_CLIENT_ID` is missing from `server/.env`. Add it following Step 2 above.

### Issue: Token expired
**Solution**: This is usually a temporary issue. Try signing in again.

## Testing

After fixing, check the server console logs. You should see:
- ✅ No warnings about missing `GOOGLE_CLIENT_ID`
- ✅ Successful token verification messages

If you still see errors, check:
1. The `.env` file is in the `server/` directory
2. The server was restarted after changing `.env`
3. No typos in the Client ID

