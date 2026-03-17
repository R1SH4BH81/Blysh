# ⚡ useblysh

**High-performance visual hashing for seamless image loading.** The unified toolkit for Python and JavaScript to turn heavy images into elegant, byte-sized blurs.

[![npm version](https://img.shields.io/npm/v/useblysh?color=blue&style=flat-square)](https://www.npmjs.com/package/useblysh)
[![pypi version](https://img.shields.io/pypi/v/useblysh?color=green&style=flat-square)](https://pypi.org/project/useblysh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🌟 Why useblysh?

Standard `loading="lazy"` leaves users staring at empty white boxes. **useblysh** eliminates this "broken" feel by encoding your images into tiny strings that can be sent inside your JSON API response.

* **Full-Stack:** Identical hashing logic for Python (Backend) and React (Frontend).
* **Zero Layout Shift:** Reserve image space instantly to prevent page jumping.
* **Performance:** Replace 1MB images with 20-byte strings during the initial load.
* **Modern:** Fully typed with TypeScript and optimized for React 18/19.
  
<img width="1441" height="387" alt="image" src="https://github.com/user-attachments/assets/3e9df482-5872-49d8-8fcf-f63fdaacde56" />

<img width="1441" height="387" alt="image" src="https://github.com/user-attachments/assets/50292c6d-f475-49ca-88bb-1fbeb74307be" />

---

## 🛠️ Installation

### Frontend (React/NPM)
```bash
npm install useblysh
```


---

## 🚀 Simple Examples


### **Generate Hash**
Generate hashes directly in the browser during an image upload.

```tsx
import { encodeImage } from 'useblysh';

const handleUpload = (event) => {
  const file = event.target.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);
  
  img.onload = () => {
    // Generate the hash from the image element
    const hash = encodeImage(img);
    console.log("Generated Hash:", hash);
    
    // Send { file, hash } to your server
  };
};
```

### **Frontend: Display Placeholder (React)**
The `ImageHash` component handles everything: it shows the blur immediately and fades in the real image once it's ready.

```tsx
import { ImageHash } from 'useblysh'; 
 
<ImageHash 
  key={id}                  // Passing the key is a good thing 
  hash={storedHash}        // The short string from your DB 
  src={imageUrl}          // The real high-quality image URL 
  className="w-full h-64 rounded-xl" 
/>
```



---

## 💡 Use Cases

### 1. Progressive Image Loading
Instead of showing a spinner or a blank box, show a beautiful blurred version of the actual image. This keeps users engaged and makes the site feel faster.

### 2. Social Media Feeds
For infinite scroll feeds (like Instagram or Pinterest), send the `useblysh` string in your initial JSON request. The app can render the entire feed layout with placeholders before a single byte of actual image data is even downloaded.

### 3. SEO & Layout Stability (CLS)
Prevent "layout shift" where content jumps around as images load. `useblysh` reserves the correct aspect ratio and space immediately.

---

## 📖 How it Works

**Blysh** uses a Discrete Cosine Transform (DCT) to extract the most important color frequencies from an image.
1. **Encoding:** The image is downsampled and converted into a set of mathematical factors, then compressed into a **Base83** string.
2. **Decoding:** The frontend takes that string and reconstructs a low-resolution version of the original image, applying a smooth blur filter for an elegant look.

---

**Built with ❤️ for the modern web.**
