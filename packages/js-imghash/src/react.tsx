import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { decode } from './decoder';

export interface ImgHashCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  hash: string;
  width?: number;
  height?: number;
  punch?: number;
}

export const ImgHashCanvas = forwardRef<HTMLCanvasElement, ImgHashCanvasProps>(
  ({ hash, width = 32, height = 32, punch = 1.0, ...props }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useImperativeHandle(ref, () => canvasRef.current!);

    // 1. Intersection Observer: Only trigger decode when the canvas is near the viewport
    useEffect(() => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once it becomes visible
          }
        },
        { rootMargin: '100px' } // Start decoding 100px before it enters the screen
      );

      observer.observe(currentCanvas);

      return () => observer.disconnect();
    }, []);

    // 2. Decode Logic: Only runs if visible
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !hash || !isVisible) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Yield to the main thread so Lenis scroll doesn't stutter
      const timeoutId = setTimeout(() => {
        try {
          const pixels = decode(hash, width, height, punch);
          // @ts-ignore
          const imageData = new ImageData(pixels, width, height);
          ctx.putImageData(imageData, 0, 0);
        } catch (error) {
          console.error('Failed to render ImgHash:', error);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [hash, width, height, punch, isVisible]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ imageRendering: 'pixelated', ...props.style }}
        {...props}
      />
    );
  }
);

ImgHashCanvas.displayName = 'ImgHashCanvas';

export interface ImgHashProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  hash: string;
  src: string;
}

/**
 * A smart image component that shows a blurred placeholder (hash)
 * until the actual image (src) loads.
 */
export const ImgHash: React.FC<ImgHashProps> = ({ hash, src, className, style: outerStyle, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);
  // @ts-ignore
  const { style: imgStyle, ...restProps } = props;

  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'inline-block',
        ...outerStyle 
      }}
    >
      {/* Blurred Placeholder */}
      <ImgHashCanvas
        hash={hash}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'none' // Prevent canvas from blocking right-clicks on the image
        }}
      />
      
      {/* Real Image */}
      <img
        {...restProps}
        src={src}
        loading="lazy" // Native browser lazy loading for the actual image file
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          ...imgStyle
        }}
      />
    </div>
  );
};