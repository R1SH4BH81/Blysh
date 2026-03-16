import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !hash) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const pixels = decode(hash, width, height, punch);
        const imageData = new ImageData(pixels, width, height);
        ctx.putImageData(imageData, 0, 0);
      } catch (error) {
        console.error('Failed to render ImgHash:', error);
      }
    }, [hash, width, height, punch]);

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
export const ImgHash: React.FC<ImgHashProps> = ({ hash, src, className, style, ...props }) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'inline-block',
        ...style 
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
        }}
      />
      
      {/* Real Image */}
      <img
        {...props}
        src={src}
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          ...props.style
        }}
      />
    </div>
  );
};
