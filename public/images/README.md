# Image Assets for Sugar And Icing

## Folder Structure

```
public/images/
├── hero/           # Homepage hero images, banners
├── products/       # Individual product photos
├── categories/     # Category icons/thumbnails
└── README.md       # This file
```

## Usage in Next.js

Images in the `public` folder can be referenced directly:

```tsx
import Image from 'next/image';

// Product images
<Image src="/images/products/brownies.jpg" alt="Brownies" width={640} height={400} />

// Hero images
<Image src="/images/hero/cake.jpg" alt="Hero" fill />

// Category icons
<Image src="/images/categories/cupcakes.jpg" alt="Cupcakes" width={80} height={80} />
```

## Image Guidelines

- **Format:** Use WebP for best performance, fallback to JPG/PNG
- **Size:** Optimize images before uploading (use tools like TinyPNG, Squoosh)
- **Naming:** Use lowercase with hyphens (e.g., `chocolate-brownies.jpg`)
- **Product photos:** Recommended 800x800px minimum
- **Hero images:** Recommended 1920x1080px

## Product Image Naming Convention

Use descriptive names that match product names:
- `signature-brownies.jpg`
- `raspberry-rose-lychee.jpg`
- `christmas-fruit-cake.jpg`
- `banana-bread.jpg`
