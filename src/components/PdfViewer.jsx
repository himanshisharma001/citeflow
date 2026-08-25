import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, AlertCircle, FileUp } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PdfViewer = ({
  file,
  numPages,
  setNumPages,
  activeHighlightPage,
  onUploadClick,
  isVisibleMobile,
}) => {
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth;
        setContainerWidth(Math.min(measured - 32, 750));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isVisibleMobile]);

  // Reset Zoom and Rotation
  const handleReset = () => {
    setScale(1.0);
    setRotation(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div
      className={`h-full flex-col bg-slate-950/40 border-r border-slate-800 select-none ${
        isVisibleMobile ? 'flex w-full' : 'hidden'
      } md:flex md:w-[55%]`}
    >
      {/* Viewer Toolbar */}
      <div className="h-11 bg-slate-900/80 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between text-xs text-slate-300 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="px-1.5 sm:px-2 font-mono text-[11px] text-slate-300 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.min(2.0, Number((prev + 0.1).toFixed(1))))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span className="text-slate-700 mx-1">|</span>

          {/* Rotate Button */}
          <button
            onClick={handleRotate}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Rotate Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom & Position Button */}
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {numPages ? `${numPages} Page${numPages > 1 ? 's' : ''}` : 'No doc'}
        </div>
      </div>

      {/* Centered Scrollable Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 flex flex-col items-center gap-6 scroll-smooth bg-[#0b0f19] w-full"
      >
        {file ? (
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="text-xs text-slate-500 animate-pulse mt-20">
                Rendering PDF document...
              </div>
            }
            error={
              <div className="flex items-center gap-2 text-rose-400 text-xs mt-20">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to load PDF file.</span>
              </div>
            }
            className="flex flex-col items-center w-full"
          >
            {Array.from(new Array(numPages), (_, index) => {
              const pageNumber = index + 1;
              const isHighlighted = activeHighlightPage === pageNumber;

              return (
                <div
                  key={`page_${pageNumber}`}
                  id={`pdf-page-${pageNumber}`}
                  className={`relative flex justify-center items-center transition-all duration-500 bg-white rounded shadow-2xl overflow-hidden ${
                    isHighlighted
                      ? 'ring-4 ring-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.5)] scale-[1.01]'
                      : 'border border-slate-800/80'
                  }`}
                >
                  <Page
                    pageNumber={pageNumber}
                    rotate={rotation}
                    width={containerWidth ? containerWidth * scale : undefined}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="flex justify-center"
                  />
                  
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur border border-slate-700 text-[10px] font-mono text-slate-300 pointer-events-none">
                    p. {pageNumber}
                  </div>
                </div>
              );
            })}
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <FileUp className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">No PDF Loaded</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Upload a document to start reading and asking questions with citations.
            </p>
            <button
              onClick={onUploadClick}
              className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Select File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};