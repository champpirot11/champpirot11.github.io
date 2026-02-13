import React, { useRef, useState, useEffect } from 'react';
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js';

interface KeepMemoriesProps {
  onRestart?: () => void;
  testMode?: boolean;
}

const MAX_PHOTOS = 6;

export const KeepMemories: React.FC<KeepMemoriesProps> = ({ onRestart, testMode = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // State
  const [photos, setPhotos] = useState<string[]>([]);
  const [pixelPhotos, setPixelPhotos] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  const [mode, setMode] = useState<'CAMERA' | 'PREVIEW_NORMAL' | 'PROCESSING' | 'PREVIEW_PIXEL'>('CAMERA');
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);

  // Printing Animation State
  const [printingState, setPrintingState] = useState<'NONE' | 'GENERATING' | 'ANIMATING' | 'DONE'>('NONE');
  const [printedStripUrl, setPrintedStripUrl] = useState<string | null>(null);

  // Test Mode Initialization
  useEffect(() => {
    if (testMode) {
        const dummyPhotos = Array.from({ length: 6 }).map((_, i) => {
            const c = document.createElement('canvas');
            c.width = 480;
            c.height = 480;
            const cx = c.getContext('2d');
            if (cx) {
                cx.fillStyle = i % 2 === 0 ? '#333' : '#111';
                cx.fillRect(0, 0, 480, 480);
                cx.fillStyle = '#fff';
                cx.font = 'bold 80px monospace';
                cx.textAlign = 'center';
                cx.textBaseline = 'middle';
                cx.fillText(`${i + 1}`, 240, 240);
                cx.font = '20px monospace';
                cx.fillText('TEST IMAGE', 240, 300);
            }
            return c.toDataURL();
        });
        setPhotos(dummyPhotos);
        // Delay slightly to simulate camera flow in test mode
        setTimeout(() => {
             finishCapture(dummyPhotos);
        }, 500);
    } else {
        startCamera();
    }
    return () => {
        stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testMode]);

  // Animation Loop for "GIF" effect in UI
  useEffect(() => {
    let interval: any;
    if ((mode === 'PREVIEW_NORMAL' || mode === 'PREVIEW_PIXEL') && photos.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % photos.length);
      }, 350); 
    }
    return () => clearInterval(interval);
  }, [mode, photos.length]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    if (testMode) return;

    setError('');
    setIsVideoReady(false);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera not supported.");
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }, 
        audio: false 
      });
      handleStreamSuccess(stream);
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        handleStreamSuccess(stream);
      } catch (finalErr) {
        setError("Camera access denied.");
      }
    }
  };

  const handleStreamSuccess = (stream: MediaStream) => {
    stopCamera();
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
          videoRef.current?.play().catch(console.error);
      };
    }
  };

  const handleCaptureTrigger = () => {
    if (photos.length >= MAX_PHOTOS) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCountdown(null);
    captureSingleFrame();
  }, [countdown]);

  const captureSingleFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx && video.videoWidth > 0) {
        const size = Math.min(video.videoWidth, video.videoHeight);
        const xOffset = (video.videoWidth - size) / 2;
        const yOffset = (video.videoHeight - size) / 2;
        
        canvas.width = 480;
        canvas.height = 480;

        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, xOffset, yOffset, size, size, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        const newPhotos = [...photos, dataUrl];
        setPhotos(newPhotos);

        if (newPhotos.length >= MAX_PHOTOS) {
            finishCapture(newPhotos);
        }
      }
    }
  };

  const finishCapture = (finalPhotos: string[]) => {
      stopCamera();
      setMode('PREVIEW_NORMAL');
      
      // Start Printing Sequence
      setPrintingState('GENERATING');
      
      // 1. Generate the strip
      drawPhotoboothStrip(finalPhotos).then((url) => {
          setPrintedStripUrl(url);
          // 2. Start Animation
          setTimeout(() => {
              setPrintingState('ANIMATING');
              
              // 3. Animation Done (slide duration 4s)
              setTimeout(() => {
                  setPrintingState('DONE');
                  // In test mode, auto download to fulfill "load image" request
                  if (testMode) {
                      handleDownloadStrip(finalPhotos, 'test-strip-layout.png');
                  }
              }, 4000);
          }, 500);
      });
  };

  const processMagic = async () => {
    setMode('PROCESSING');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const processedImages: string[] = [];

    const pixelateImage = (src: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(src); return; }

                const w = 480;
                const h = 480;
                canvas.width = w;
                canvas.height = h;
                
                const pixelFactor = 0.12; 
                const sw = w * pixelFactor;
                const sh = h * pixelFactor;

                ctx.drawImage(img, 0, 0, sw, sh);
                
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = w;
                finalCanvas.height = h;
                const finalCtx = finalCanvas.getContext('2d');
                if(finalCtx) {
                    finalCtx.imageSmoothingEnabled = false;
                    finalCtx.drawImage(canvas, 0, 0, sw, sh, 0, 0, w, h);
                    resolve(finalCanvas.toDataURL('image/png'));
                } else {
                    resolve(src);
                }
            };
        });
    };

    for (const p of photos) {
        const pixelated = await pixelateImage(p);
        processedImages.push(pixelated);
    }

    setPixelPhotos(processedImages);
    setMode('PREVIEW_PIXEL');
  };

  // --- HELPER FOR TIMESTAMP ---
  const getFormattedTimestamp = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const hour = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hour}:${min}`;
  };

  // --- DRAWING HELPERS ---

  const drawPhotoboothStrip = async (images: string[]): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Constants for layout
        const imgSize = 300;
        const gap = 15; // Reduced from 25 to 15 (closer photos)
        const sideMargin = 100; // Left sidebar width
        const topMargin = 90;
        const bottomMargin = 120;
        const rightMargin = 40;
        
        const cols = 2;
        const rows = Math.ceil(images.length / cols); 

        const canvasWidth = sideMargin + (imgSize * cols) + (gap * (cols - 1)) + rightMargin;
        const canvasHeight = topMargin + (imgSize * rows) + (gap * (rows - 1)) + bottomMargin;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 1. Background (Gradient + Noise)
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#e0f2fe'); // Light Blue Top
        gradient.addColorStop(1, '#7dd3fc'); // Darker Blue Bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Add Noise (Increased intensity)
        ctx.save();
        ctx.globalAlpha = 0.35; // Increased from 0.15 for more visible grain
        for (let i = 0; i < canvasWidth; i += 3) {
            for (let j = 0; j < canvasHeight; j += 3) {
                if (Math.random() > 0.5) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(i, j, 1.5, 1.5);
                }
            }
        }
        ctx.restore();

        // 2. Left Sidebar (Vertical Icons Strip) - Rectangular
        const sidebarX = 25;
        const sidebarY = topMargin;
        const sidebarWidth = 50;
        const sidebarHeight = (imgSize * 2); 
        
        // Draw Rectangular sidebar background
        ctx.beginPath();
        ctx.rect(sidebarX, sidebarY, sidebarWidth, sidebarHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#1e3a8a'; // Dark blue border
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Icons in sidebar
        const icons = ['📸', '💖', '🧸', '🌹', '💏', '✨'];
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        icons.forEach((icon, i) => {
            const y = sidebarY + 35 + (i * 50);
            if (y < sidebarY + sidebarHeight - 10) {
                 ctx.fillText(icon, sidebarX + (sidebarWidth/2), y);
            }
        });

        // 3. Vertical Text "Champ & Oui."
        ctx.save();
        ctx.translate(sidebarX + sidebarWidth/2, sidebarY + sidebarHeight + 60);
        ctx.rotate(-Math.PI / 2); // Rotate -90 deg
        ctx.textAlign = 'right';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillStyle = '#1e3a8a'; // dark blue
        ctx.fillText("Champ & Oui.", 0, 0);
        ctx.restore();

        // 4. Photos Grid & Decorations
        let loadedCount = 0;

        const drawDecorations = () => {
             // Decoration 1: Top Right "Valentine Day" Tag
             // Intentionally overlaps the Top Right Photo (Row 0, Col 1)
             // Photo 1 starts at x = sideMargin + imgSize + gap = 100 + 300 + 15 = 415
             
             ctx.save();
             const tagText = "Valentine Day";
             ctx.font = 'bold 24px sans-serif';
             const textMetrics = ctx.measureText(tagText);
             const tagW = textMetrics.width + 40; // ~ 200px
             const tagH = 50;
             
             const tagX = 540; // Adjusted for new gap
             const tagY = 70;
             
             ctx.translate(tagX, tagY);
             ctx.rotate(0.08); // Slight tilt
             
             ctx.beginPath();
             // Rounded tag as requested
             ctx.roundRect(0, 0, tagW, tagH, 25);
             ctx.fillStyle = '#fef08a'; // yellow-200
             ctx.fill();
             ctx.lineWidth = 3;
             ctx.strokeStyle = '#000';
             ctx.stroke();
             
             // Inner decorative line
             ctx.beginPath();
             ctx.roundRect(5, 5, tagW-10, tagH-10, 20);
             ctx.lineWidth = 1;
             ctx.strokeStyle = 'rgba(0,0,0,0.2)';
             ctx.stroke();

             ctx.fillStyle = '#000';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText(tagText, tagW/2, tagH/2 + 2);
             ctx.restore();

             // Decoration 2: "For You" Badge (Replaces Happy!!)
             // Overlap Bottom Left of Mid Left Photo (Row 1, Col 0)
             
             ctx.save();
             const badgeW = 120;
             const badgeH = 90; // Slightly taller for 2 lines
             const badgeX = 80; 
             const badgeY = 660; // Adjusted position
             
             ctx.translate(badgeX, badgeY);
             ctx.rotate(-0.15); // Tilted left
             
             // Pink background
             ctx.beginPath();
             ctx.roundRect(0, 0, badgeW, badgeH, 15);
             ctx.fillStyle = '#fbcfe8'; // pink-200
             ctx.fill();
             ctx.lineWidth = 3;
             ctx.strokeStyle = '#be185d'; // Dark Pink Border
             ctx.stroke();
             
             ctx.fillStyle = '#be185d';
             ctx.textAlign = 'center';
             
             ctx.font = '900 24px sans-serif';
             // Split into two lines
             ctx.fillText("For", badgeW/2, badgeH/2 - 12);
             ctx.fillText("You", badgeW/2, badgeH/2 + 18);
             ctx.restore();

             // Timestamp at bottom right (Digital style)
             ctx.save();
             ctx.font = 'bold 20px "Courier New", monospace';
             ctx.fillStyle = '#1e3a8a';
             ctx.textAlign = 'right';
             ctx.fillText(getFormattedTimestamp(), canvasWidth - 40, canvasHeight - 40);
             ctx.restore();
        };

        images.forEach((src, index) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                const x = sideMargin + (col * (imgSize + gap));
                const y = topMargin + (row * (imgSize + gap));

                // White border for photo (Thinner: 3px)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 3, y - 3, imgSize + 6, imgSize + 6);
                
                // Draw Image
                ctx.drawImage(img, x, y, imgSize, imgSize);
                
                // Inner Border on image
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, imgSize, imgSize);

                loadedCount++;
                if (loadedCount === images.length) {
                    drawDecorations(); // Draw decorations on TOP of images
                    resolve(canvas.toDataURL('image/png'));
                }
            };
        });
    });
  };

  const createGifBlob = async (images: string[]): Promise<Blob | null> => {
     return new Promise(async (resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 480;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve(null); return; }

        // Initialize GIF Encoder
        const encoder = new GIFEncoder();

        // Load all images first
        const imageElements = await Promise.all(images.map(src => {
            return new Promise<HTMLImageElement>((r) => {
                const img = new Image();
                img.src = src;
                img.onload = () => r(img);
            });
        }));

        // Loop through images to create frames
        for (const img of imageElements) {
            // Draw frame
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Date Stamp Overlay
            // Updated: Smaller Font to match footer text (12px)
            ctx.save();
            ctx.fillStyle = '#f97316'; 
            ctx.font = 'bold 12px "Courier New", monospace'; 
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 2;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            // Adjusted position to match footer text line height (canvas.height - 15)
            ctx.fillText(getFormattedTimestamp(), canvas.width - 15, canvas.height - 15);
            ctx.restore();

            // Watermark (Footer Title)
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText("VALENTINE 2026 - Champ & Oui", 15, canvas.height - 15);

            // Get image data for GIF encoding
            const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Quantize colors (create palette) and apply it
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);

            // Add frame to encoder
            encoder.writeFrame(index, width, height, { palette, delay: 350 });
        }

        // Finish encoding
        encoder.finish();
        
        // Return Blob
        resolve(new Blob([encoder.bytes()], { type: 'image/gif' }));
     });
  };

  // --- DOWNLOAD HANDLERS ---

  const handleDownloadStrip = async (targetPhotos: string[], filename: string) => {
      const dataUrl = await drawPhotoboothStrip(targetPhotos);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
  };

  const handleDownloadAnimation = async (targetPhotos: string[], filename: string) => {
      setIsGeneratingGif(true);
      const blob = await createGifBlob(targetPhotos);
      setIsGeneratingGif(false);
      
      if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          link.click();
          // Cleanup
          setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
  };


  const handleRetake = () => {
    setPhotos([]);
    setPixelPhotos([]);
    setPrintingState('NONE');
    setPrintedStripUrl(null);
    setMode('CAMERA');
    startCamera();
  };

  // Logic to show controls
  const showControls = printingState === 'NONE' || printingState === 'DONE';

  return (
    <div className="flex flex-col items-center justify-start h-full p-2 w-full animate-pop relative overflow-y-auto">
      
      {/* Magic Processing Dialog */}
      {(mode === 'PROCESSING' || isGeneratingGif) && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center rounded-sm">
            <div className="text-6xl animate-bounce mb-4">🪄</div>
            <p className="text-white font-['Kanit'] text-lg font-bold animate-pulse text-center px-4">
                {isGeneratingGif ? 'กำลังสร้างไฟล์ GIF...' : 'แชมป์กำลังเสกเวทมนต์...'}<br/>
                <span className="text-xs text-green-300 font-normal">
                   {isGeneratingGif ? '(Creating GIF...)' : '(Champ is casting magic...)'}
                </span>
            </p>
            {mode === 'PROCESSING' && (
                <div className="mt-4 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-[width_3s_ease-in-out_forwards]" style={{width: '0%'}}></div>
                </div>
            )}
        </div>
      )}

      <h2 className="text-center text-xs text-green-900 font-bold mb-4 border-b-2 border-green-300 pb-2 w-full shrink-0">
        PIXEL MEMORIES 📸
      </h2>

      <div className="relative mb-4 shrink-0 z-20">
        {/* Frame */}
        <div className="border-8 border-gray-800 rounded-lg p-1 bg-gray-200 shadow-xl relative inline-block">
             <div className="absolute -top-3 -left-3 text-2xl animate-bounce z-20">💖</div>
             <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce delay-100 z-20">✨</div>
             
             {/* Viewport */}
             <div className="relative w-56 h-56 bg-black overflow-hidden rounded-sm border-2 border-gray-600">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-white text-[10px] text-center p-4 gap-2">
                        <span className="text-2xl">🚫</span>
                        <span>{error}</span>
                        {!testMode && <button onClick={startCamera} className="mt-2 bg-white text-black px-2 py-1 rounded">Retry</button>}
                    </div>
                ) : (
                    <>
                        {/* CAMERA MODE */}
                        {mode === 'CAMERA' && (
                            <div className="absolute inset-0 w-full h-full bg-black">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {!isVideoReady && <div className="absolute inset-0 flex items-center justify-center text-white text-xs animate-pulse">Loading...</div>}
                                
                                {/* Counter Overlay */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold">
                                    {photos.length}/{MAX_PHOTOS}
                                </div>
                            </div>
                        )}

                        {/* PREVIEW MODES (GIF Effect) / PRINTING */}
                        {(mode === 'PREVIEW_NORMAL' || mode === 'PREVIEW_PIXEL') && (
                            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center p-2">
                                {printingState !== 'DONE' && printingState !== 'NONE' ? (
                                    <div className="flex flex-col items-center justify-center h-full text-green-400 animate-pulse">
                                        <span className="text-3xl mb-2">🖨️</span>
                                        <span className="text-xs font-bold">PRINTING...</span>
                                    </div>
                                ) : (
                                    <div className="pixel-border bg-white w-full h-full overflow-hidden relative">
                                        <img 
                                            src={mode === 'PREVIEW_PIXEL' ? pixelPhotos[currentFrameIndex] : photos[currentFrameIndex]}
                                            alt="Memory Frame"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-0 right-0 text-center">
                                            <span className="bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full">
                                                GIF PREVIEW
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hidden Canvas for Capture */}
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Countdown Overlay */}
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                                <span className="text-6xl text-white font-bold animate-ping">{countdown === 0 ? 'CHEESE!' : countdown}</span>
                            </div>
                        )}
                    </>
                )}
                
                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAADCAYAAABS3WWCAAAAE0lEQVQIW2NkQAKrVq36zwjjAwBztgP5Q4h3+AAAAABJRU5ErkJggg==')] opacity-20 z-10"></div>
             </div>
        </div>
      </div>

      {/* Printing Animation Section */}
      {printingState !== 'NONE' && (
          <div className="flex flex-col items-center w-full max-w-[280px] mt-2 mb-4 relative z-10">
               {/* Device Body */}
               <div className="w-full bg-gray-200 border-b-4 border-r-4 border-gray-400 rounded-lg p-2 shadow-xl relative z-20">
                   {/* Decorative Screws */}
                   <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-500 rotate-45"></div></div>
                   <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-500 rotate-45"></div></div>
                   
                   <div className="text-[8px] font-bold text-gray-500 tracking-widest text-center uppercase mb-1 mt-1">
                      Memories Printer
                   </div>
  
                   {/* The Slot */}
                   <div className="w-full h-2.5 bg-gray-800 rounded-full border-b border-white/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] relative overflow-hidden mx-auto max-w-[90%]"></div>
                   
                   {/* Status Light */}
                   <div className="absolute bottom-2 right-3 flex items-center gap-1">
                       <div className={`w-1.5 h-1.5 rounded-full ${printingState === 'DONE' ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></div>
                   </div>
               </div>
  
               {/* The Paper */}
               {printedStripUrl && (
                   <div className="relative w-[220px] h-[320px] overflow-hidden -mt-2 pt-2 bg-transparent z-10">
                        <div 
                          className={`w-full transform transition-transform ${printingState === 'ANIMATING' ? 'animate-print-slide' : ''}`}
                          style={{ 
                              transform: printingState === 'GENERATING' ? 'translateY(-105%)' : (printingState === 'DONE' ? 'translateY(0)' : undefined) 
                          }}
                        >
                             <img 
                                src={printedStripUrl} 
                                alt="Printed Strip" 
                                className="w-full shadow-lg rounded-sm"
                             />
                        </div>
                   </div>
               )}
          </div>
      )}

      {/* Styles for animation */}
      <style>{`
          @keyframes printSlide {
              0% { transform: translateY(-105%); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(0); opacity: 1; }
          }
          .animate-print-slide {
              animation: printSlide 4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
      `}</style>

      <div className={`flex flex-col gap-2 w-full max-w-[280px] transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {mode === 'CAMERA' ? (
             <button 
                onClick={handleCaptureTrigger}
                disabled={!!error || !isVideoReady || countdown !== null}
                className="w-full bg-blue-500 text-white py-3 border-b-4 border-blue-700 rounded font-bold text-xs active:border-b-0 active:translate-y-1 shadow-md disabled:bg-gray-400 disabled:border-gray-600 transition-all flex justify-center items-center gap-2"
             >
                {countdown !== null ? '...' : (photos.length === 0 ? 'START SHOOTING (0/6) 📸' : `NEXT SHOT (${photos.length}/${MAX_PHOTOS}) 📸`)}
             </button>
        ) : (
            <>
                {/* --- NORMAL MODE BUTTONS --- */}
                {mode === 'PREVIEW_NORMAL' && (
                    <>
                        <button 
                            onClick={processMagic}
                            className="w-full bg-purple-500 text-white py-2 border-b-4 border-purple-700 rounded font-bold text-xs active:border-b-0 active:translate-y-1 shadow-md animate-pulse flex justify-center items-center gap-2 mb-1"
                        >
                            <span>🪄</span> MAKE IT PIXEL!
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => handleDownloadStrip(photos, 'valentine-2026-original.png')}
                                className="w-full bg-blue-500 text-white py-2 border-b-4 border-blue-700 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                STRIP (ORIG)
                            </button>
                            <button 
                                onClick={() => handleDownloadAnimation(photos, 'valentine-2026-original.gif')}
                                className="w-full bg-blue-400 text-white py-2 border-b-4 border-blue-600 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                GIF (ORIG)
                            </button>
                        </div>
                    </>
                )}

                {/* --- PIXEL MODE BUTTONS --- */}
                {mode === 'PREVIEW_PIXEL' && (
                    <div className="flex flex-col gap-2">
                        {/* Pixel Downloads */}
                         <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => handleDownloadStrip(pixelPhotos, 'valentine-2026-pixel.png')}
                                className="w-full bg-green-600 text-white py-2 border-b-4 border-green-800 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                STRIP (PIXEL)
                            </button>
                            <button 
                                onClick={() => handleDownloadAnimation(pixelPhotos, 'valentine-2026-pixel.gif')}
                                className="w-full bg-green-500 text-white py-2 border-b-4 border-green-700 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                GIF (PIXEL)
                            </button>
                        </div>

                        <div className="text-[9px] text-center text-green-800 font-bold -my-1">--- OR ORIGINAL ---</div>

                        {/* Original Downloads (Kept in Pixel Mode) */}
                        <div className="grid grid-cols-2 gap-2 opacity-90">
                            <button 
                                onClick={() => handleDownloadStrip(photos, 'valentine-2026-original.png')}
                                className="w-full bg-blue-500 text-white py-2 border-b-4 border-blue-700 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                STRIP (ORIG)
                            </button>
                            <button 
                                onClick={() => handleDownloadAnimation(photos, 'valentine-2026-original.gif')}
                                className="w-full bg-blue-400 text-white py-2 border-b-4 border-blue-600 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 shadow-md"
                            >
                                GIF (ORIG)
                            </button>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={handleRetake}
                    disabled={mode === 'PROCESSING' || isGeneratingGif}
                    className="w-full mt-2 bg-yellow-400 text-yellow-900 py-2 border-b-4 border-yellow-600 rounded font-bold text-[10px] active:border-b-0 active:translate-y-1 disabled:opacity-50"
                >
                    DELETE & RETAKE ↺
                </button>
            </>
        )}
      </div>

      <p className="mt-4 text-[9px] text-green-800 font-['Kanit'] italic text-center shrink-0">
         {mode === 'CAMERA' ? "Take 6 photos to make a memory!" : "Memories preserved in time."}<br/>
         (เก็บไว้เป็นที่ระลึกนะ)
      </p>
    </div>
  );
};