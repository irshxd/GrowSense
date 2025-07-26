import React, { useState } from 'react';
// We are temporarily not using THREE or GLTFLoader for the image placeholder,
// so these imports are commented out to avoid warnings if they aren't used.
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// This component will now display a static 2D generated image as a placeholder for the 3D plant model.
export default function Plant3DModel() {
  // Use a direct state for the image source, initially pointing to the local 'plant.avif' file.
  const [currentImageSrc, setCurrentImageSrc] = useState("https://png.pngtree.com/png-clipart/20250307/original/pngtree-an-image-of-a-basil-plant-in-small-terracotta-pot-png-image_20594084.png");
  
  // A truly robust fallback from a different, widely available service, just in case the primary URL is blocked.
  const ultimateFallbackSrc = "https://via.placeholder.com/800x600/cccccc/333333?text=Image+Unavailable";

  // The rendering logic directly uses the image tag.
  // The onError attribute handles failures to load the `currentImageSrc`.
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: '1.5rem', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
      <img
        src={currentImageSrc} // Start with the actual plant image URL
        alt="Plant Placeholder"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '1.5rem' }}
        onError={(e) => {
          // This `onError` fires if the `src` image fails to load.
          // We check if the current source is already the ultimate fallback.
          // If not, we set it to the ultimate fallback URL.
          // This prevents an infinite loop if even the fallback URL somehow fails or triggers an error.
          if (e.target.src !== ultimateFallbackSrc) {
            e.target.onerror = null; // Prevent subsequent calls to onError for this image element
            e.target.src = ultimateFallbackSrc; // Set the source to the ultimate fallback
            console.error("Primary plant image failed to load. Using ultimate fallback image.");
          } else {
            console.error("Ultimate fallback image also failed to load. Check network or image service availability.");
          }
        }}
      />
    </div>
  );
}
