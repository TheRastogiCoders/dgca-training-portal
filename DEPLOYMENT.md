# 🚀 Deployment Guide: DGCA Training Portal

## Overview
This guide will help you deploy your DGCA Training Portal to:
- **Client (Frontend)**: Vercel
- **Server (Backend)**: Render

## Prerequisites
- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account

## Step 1: Push to GitHub

### 1.1 Initialize Git Repository
```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DGCA Training Portal with mobile optimization"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `dgca-training-portal`
4. Description: `DGCA Training Portal - Aviation Learning Platform`
5. Make it Public or Private
6. **Don't** initialize with README, .gitignore, or license
7. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dgca-training-portal.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Server to Render

### 2.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 2.2 Deploy Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `dgca-training-portal`
3. Configure the service:
   - **Name**: `dgca-training-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node simple-server.js`
   - **Instance Type**: Free (or upgrade as needed)

### 2.3 Environment Variables
Add these environment variables in Render dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dgca-training?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=10000
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your server URL: `https://dgca-training-server.onrender.com`

## Step 3: Deploy Client to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click "New Project"
2. Import your GitHub repository: `dgca-training-portal`
3. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3.3 Environment Variables
Add these environment variables in Vercel dashboard:
```
REACT_APP_API_URL=https://dgca-training-server.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at: `https://dgca-training-portal.vercel.app`

## Step 4: Update MongoDB Atlas

### 4.1 Network Access
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to "Network Access"
3. Add IP Address: `0.0.0.0/0` (allow all IPs for production)

### 4.2 Database User
1. Go to "Database Access"
2. Create a database user with read/write permissions
3. Use this user in your `MONGODB_URI`

## Step 5: Test Your Deployment

### 5.1 Test Server
Visit: `https://dgca-training-server.onrender.com/api/health`
Should return: `{"status":"OK"}`

### 5.2 Test Client
Visit: `https://dgca-training-portal.vercel.app`
Should load your application

## Step 6: Custom Domain (Optional)

### 6.1 Vercel Custom Domain
1. Go to Vercel dashboard
2. Select your project
3. Go to "Domains"
4. Add your custom domain
5. Update DNS records as instructed

### 6.2 Render Custom Domain
1. Go to Render dashboard
2. Select your web service
3. Go to "Settings" → "Custom Domains"
4. Add your custom domain
5. Update DNS records as instructed

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Vercel/Render
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

2. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check CORS settings in server
   - Ensure server is running and accessible

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network access settings in MongoDB Atlas
   - Ensure database user has proper permissions

### Support:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

## Production Checklist

- [ ] Server deployed to Render
- [ ] Client deployed to Vercel
- [ ] Environment variables configured
- [ ] MongoDB Atlas configured
- [ ] Custom domains set up (optional)
- [ ] SSL certificates active
- [ ] Application tested end-to-end
- [ ] Performance monitoring set up (optional)

## Maintenance

### Regular Updates:
1. Push changes to GitHub
2. Vercel and Render will auto-deploy
3. Monitor logs for any issues
4. Update dependencies regularly

### Scaling:
- Upgrade Render plan for more resources
- Use Vercel Pro for advanced features
- Consider CDN for static assets
- Implement caching strategies

---

🎉 **Congratulations!** Your DGCA Training Portal is now live and accessible worldwide!
