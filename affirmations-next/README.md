# Affirmations App - Next.js

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your API keys:
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Server-side data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cloudinary](https://cloudinary.com/) - Image hosting and transformations
- [Unsplash API](https://unsplash.com/developers) - Random photos
