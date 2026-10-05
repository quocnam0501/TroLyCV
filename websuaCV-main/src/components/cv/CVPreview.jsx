import React, { useState, useEffect, useRef } from 'react';
import ModernTemplate from '@/components/cv/templates/ModernTemplate';
import MinimalTemplate from '@/components/cv/templates/MinimalTemplate';
import ProfessionalTemplate from '@/components/cv/templates/ProfessionalTemplate';

const TEMPLATES = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
};

export default function CVPreview({ profile, masterCV, photoUrl, template = 'modern' }) {
  const containerRef = useRef(null);
  const templateRef = useRef(null);
  const [scale, setScale] = useState(0.65);
  const [wrapperHeight, setWrapperHeight] = useState(0);

  const TemplateComponent = TEMPLATES[template] || TEMPLATES.modern;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      const width = containerRef.current.offsetWidth;
      setScale(Math.min(width / 794, 1));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (templateRef.current) {
      setWrapperHeight(templateRef.current.offsetHeight * scale);
    }
  }, [scale, template, profile, masterCV, photoUrl]);

  return (
    <div ref={containerRef} style={{ height: wrapperHeight }} className="overflow-hidden">
      <div
        ref={templateRef}
        data-cv-template
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '794px' }}
      >
        <TemplateComponent profile={profile} masterCV={masterCV} photoUrl={photoUrl} />
      </div>
    </div>
  );
}