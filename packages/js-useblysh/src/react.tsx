import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { decode } from './decoder';

export interface ImageHashCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  hash: string;
  width?: number;
  height?: number;
  punch?: number;
}

export const ImageHashCanvas = forwardRef<HTMLCanvasElement, ImageHashCanvasProps>(
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
            observer.disconnect(); 
          }
        },
        { 
          rootMargin: '200px', // Increased margin to trigger earlier
          threshold: 0.01      // Trigger as soon as even 1% is visible
        } 
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
          console.error('Failed to render ImageHash:', error);
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

ImageHashCanvas.displayName = 'ImageHashCanvas';

export interface ImageHashProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  hash: string;
  src: string;
}

/**
 * A smart image component that shows a blurred placeholder (hash)
 * until the actual image (src) loads.
 */
export const ImageHash: React.FC<ImageHashProps> = ({ hash, src, className, style: outerStyle, ...props }) => {
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
      <ImageHashCanvas
        hash={hash}
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'inherit', // Inherit from parent className
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      
      {/* Real Image */}
      <img
        {...restProps}
        className={className}
        src={src}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'inherit', // Inherit from parent className
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          ...imgStyle
        }}
      />
    </div>
  );
};