---
description: Deploy the application to Vercel
---

# Deploying AfroLingo to Vercel

This guide walks you through deploying your Next.js application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your `GEMINI_API_KEY` environment variable value

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
   - If your code isn't in Git yet, initialize a repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     ```
   - Push to GitHub/GitLab/Bitbucket
3. Vercel will auto-detect Next.js settings
4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your-api-key-here`
5. Click "Deploy"

### 3. Deploy via CLI (Alternative)

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? (default is fine)
- Directory? `./`
- Override settings? **N**

Add environment variable:
```bash
vercel env add GEMINI_API_KEY
```

Paste your API key when prompted.

### 4. Verify Deployment

1. Vercel will provide a deployment URL (e.g., `https://your-app.vercel.app`)
2. Visit the URL and test:
   - Complete the onboarding flow
   - Generate lessons
   - Verify images load correctly
   - Test the interactive lesson chat

## Post-Deployment

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring

- View deployment logs in the Vercel dashboard
- Check the "Analytics" tab for usage metrics
- Monitor function execution times

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### API Key Issues

- Confirm `GEMINI_API_KEY` is set in Vercel environment variables
- Redeploy after adding/updating environment variables

### Images Not Loading

- Check browser console for CORS errors
- Verify Pollinations.ai is accessible from your deployment region
- Base64 conversion should handle most cases automatically

## Redeployment

Vercel automatically redeploys on every push to your main branch. To manually redeploy:

```bash
vercel --prod
```

Or use the "Redeploy" button in the Vercel dashboard.
