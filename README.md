# PIXEL & PROOF | Production Site

This project is a premium, performance-optimized website for Pixel & Proof.

## Deployment (Vercel)

1. **Push to GitHub**: Connect this repository to your Vercel account.
2. **Environment Variables**: Set the following in the Vercel dashboard:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string (provided in the .env file).
3. **Build Settings**: 
   - Framework Preset: Vite
   - Output Directory: `dist`
   - Install Command: `npm install`

## Folder Structure

- `/api`: Serverless functions (compatible with Vercel).
- `/src`: Frontend assets and logic.
- `/public`: Static assets (icons, OG images).
- `index.html`: SEO-optimized main entry point.

## Performance Optimization

- All images are lazy-loaded.
- Zero render-blocking scripts in the critical path.
- CSS uses a modular structure with minimal overrides.
- Preconnects used for Google Fonts to reduce TBT.
