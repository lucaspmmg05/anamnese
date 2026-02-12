import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string | null) => void;
  initialSignature?: string | null;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, initialSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        
        if (initialSignature) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                setIsEmpty(false);
            };
            img.src = initialSignature;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    e.preventDefault(); // Prevent scrolling on touch
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setIsEmpty(false);
    }
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
        setIsDrawing(false);
        onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
      onSave(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white touch-none overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-48 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300">
             <span className="flex items-center gap-2 text-sm"><PenTool size={16} /> Assine aqui</span>
           </div>
        )}
      </div>
      <button
        onClick={clear}
        type="button"
        className="self-end text-sm text-red-500 flex items-center gap-1 hover:text-red-700 transition-colors"
      >
        <Eraser size={14} /> Limpar Assinatura
      </button>
    </div>
  );
};
