import React, { useState, useEffect, useRef } from 'react';

export default function DocumentPreview({ children, width = 794 }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(0.65);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const w = containerRef.current.offsetWidth;
      setScale(Math.min(w / width, 1));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.offsetHeight * scale);
    }
  }, [scale, children]);

  return (
    <div ref={containerRef} style={{ height }} className="overflow-hidden">
      <div
        ref={contentRef}
        data-cv-template
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${width}px` }}
      >
        {children}
      </div>
    </div>
  );
}