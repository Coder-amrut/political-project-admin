# EVM Deployment Guide

## ✅ Fixed Issues:
1. **Production URL Configuration** - Now uses `https://evm-demo.in` when deployed
2. **Copy Link Button** - Will copy the correct production URL
3. **View Button** - Will open the correct production URL

## 📁 Files Modified:
- `src/config.js` - Created new configuration file
- `src/components/admin/CandidatePagesTab.jsx` - Updated to use production URL
- `vite.config.js` - Added proper build configuration
- `public/_redirects` - For Netlify hosting
- `public/.htaccess` - For Apache/cPanel hosting
- `vercel.json` - For Vercel hosting

## 🚀 Deployment Steps:

### 1. Build the Project:
```bash
npm run build
```

### 2. Deploy to Your Hosting:

**For cPanel/Shared Hosting:**
- Upload all files from `dist/` folder to your `public_html/` directory
- Make sure `.htaccess` file is uploaded

**For Vercel:**
```bash
vercel --prod
```

**For Netlify:**
```bash
netlify deploy --prod
```

## 🔧 Configuration:

### Change Production URL:
Edit `src/config.js` and change:
```javascript
export const PRODUCTION_URL = 'https://evm-demo.in';
```

### How It Works:
- **On localhost**: Uses `http://localhost:5173` (or your local port)
- **On production**: Uses `https://evm-demo.in`
- **Automatic detection**: Based on hostname

## ✅ Test After Deployment:

1. Go to: `https://evm-demo.in/admin`
2. Create a new candidate page
3. Click "📋 लिंक कॉपी करा" button
4. Paste the link - it should be: `https://evm-demo.in/your-slug`
5. Click "👁️ पहा" button - it should open the correct URL

## 📝 Notes:
- The app automatically detects if it's running on localhost or production
- No need to change any code when switching between development and production
- All links will use the correct URL based on the environment
