import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom"; // To get roomId from URL

const socket = io("http://localhost:4000");

const Whiteboard: React.FC = () => {
  const { roomId } = useParams(); // Get roomId from URL
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("black");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [isErasing, setIsErasing] = useState<boolean>(false);

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("loadCanvas", (data) => {
      if (canvasRef.current) {
        const img = new Image();
        img.src = data;
        img.onload = () => {
          contextRef.current?.drawImage(img, 0, 0);
        };
      }
    });

    socket.on("drawing", (data) => {
      if (canvasRef.current) {
        const img = new Image();
        img.src = data;
        img.onload = () => {
          contextRef.current?.drawImage(img, 0, 0);
        };
      }
    });

    socket.on("clearCanvas", () => {
      if (contextRef.current && canvasRef.current) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    });

    return () => {
      socket.off("drawing");
      socket.off("loadCanvas");
      socket.off("clearCanvas")
    };
  }, [roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    canvas.style.border = "2px solid black";

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    contextRef.current = context;
  }, [color, lineWidth]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (!contextRef.current) return;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = event.nativeEvent;

    contextRef.current.strokeStyle = isErasing ? "white" : color;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.closePath();
      const image = canvasRef.current.toDataURL();
      socket.emit("drawing", { roomId, data: image });
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      socket.emit("clearCanvas", { roomId });
    }
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="mb-4 space-x-2">
        <button onClick={clearCanvas} className="px-4 py-2 bg-red-500 text-white rounded">Clear</button>
        <button onClick={() => setIsErasing(!isErasing)} className="px-4 py-2 bg-gray-500 text-white rounded">
          {isErasing ? "Disable Eraser" : "Enable Eraser"}
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="px-2 py-1 border rounded"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        />
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="bg-white"
      />
    </div>
  );
};

export default Whiteboard;
