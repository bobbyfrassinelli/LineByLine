import React, { useRef, useState } from "react";

// SketchRNN stroke format: [dx, dy, pen_down, pen_up, pen_end]
type Stroke = [number, number, number, number, number];

type DrawingCanvasProps = {
  width?: number;
  height?: number;
  onStrokesChange?: (strokes: Stroke[]) => void;
};

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onStrokesChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  // Helper to get mouse or touch position
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ("clientX" in e) {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return null;
  };

  // Start drawing
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (!pos) return;
    setDrawing(true);
    setLastPos(pos);
    // Start a new stroke: pen_down = 1, pen_up = 0, pen_end = 0
    // dx, dy are 0 for the first point
    setStrokes((prev) => [...prev, [0, 0, 1, 0, 0]]);
  };

  // Drawing
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !lastPos) return;
    const pos = getPos(e);
    if (!pos) return;
    const dx = pos.x - lastPos.x;
    const dy = pos.y - lastPos.y;
    // pen_down = 1, pen_up = 0, pen_end = 0 for mid-stroke
    setStrokes((prev) => [...prev, [dx, dy, 1, 0, 0]]);
    drawLine(lastPos.x, lastPos.y, pos.x, pos.y);
    setLastPos(pos);
  };

  // End drawing
  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    setDrawing(false);
    setLastPos(null);
    // pen_down = 0, pen_up = 1, pen_end = 0 for stroke end
    setStrokes((prev) => {
      const updated: Stroke[] = [...prev, [0, 0, 0, 1, 0]];
      if (onStrokesChange) onStrokesChange(updated);
      return updated;
    });
  };

  // Draw a line segment on the canvas
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Redraw all strokes from the vector data
  const redraw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    let x = width / 2;
    let y = height / 2;
    for (let i = 0; i < strokes.length; i++) {
      const [dx, dy, pen_down, pen_up, pen_end] = strokes[i];
      if (i === 0 || pen_up) {
        // Move to new start
        x += dx;
        y += dy;
      } else if (pen_down) {
        const newX = x + dx;
        const newY = y + dy;
        drawLine(x, y, newX, newY);
        x = newX;
        y = newY;
      }
      // Ignore pen_end for now
    }
  };

  // Reset the canvas and strokes
  const handleReset = () => {
    setStrokes([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, width, height);
    if (onStrokesChange) onStrokesChange([]);
  };

  // Redraw when strokes change
  React.useEffect(() => {
    redraw();
    // eslint-disable-next-line
  }, [strokes]);

  // Log strokes to the console whenever they change
  React.useEffect(() => {
    if (strokes.length > 0) {
      // Print the array(s) to the browser console
      // eslint-disable-next-line no-console
      console.log("Current strokes:", strokes);
    }
  }, [strokes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "2px solid #FFBF7F", background: "#fff", cursor: "crosshair" }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      <button onClick={handleReset} style={{ marginTop: 16, padding: "8px 20px", background: "#FFBF7F", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
        Reset
      </button>
    </div>
  );
}; 