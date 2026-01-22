'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './SignatureModal.module.css';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
  guardianName: string;
  locale: string;
}

export default function SignatureModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  guardianName,
  locale 
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Set drawing styles
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureDataUrl = canvas.toDataURL('image/png');
    onConfirm(signatureDataUrl);
  };

  if (!isOpen) return null;

  const texts = {
    ca: {
      title: 'Signatura Digital',
      instruction: 'Si us plau, signa al requadre utilitzant el dit o el ratolí',
      guardianLabel: 'Nom del tutor legal',
      clear: 'Esborrar',
      cancel: 'Cancel·lar',
      confirm: 'Confirmar i Enviar'
    },
    es: {
      title: 'Firma Digital',
      instruction: 'Por favor, firma en el recuadro usando el dedo o el ratón',
      guardianLabel: 'Nombre del tutor legal',
      clear: 'Borrar',
      cancel: 'Cancelar',
      confirm: 'Confirmar y Enviar'
    },
    en: {
      title: 'Digital Signature',
      instruction: 'Please sign in the box using your finger or mouse',
      guardianLabel: 'Legal guardian name',
      clear: 'Clear',
      cancel: 'Cancel',
      confirm: 'Confirm and Submit'
    },
    ar: {
      title: 'التوقيع الرقمي',
      instruction: 'يرجى التوقيع في المربع باستخدام إصبعك أو الماوس',
      guardianLabel: 'اسم الوصي القانوني',
      clear: 'مسح',
      cancel: 'إلغاء',
      confirm: 'تأكيد وإرسال'
    },
    ur: {
      title: 'ڈیجیٹل دستخط',
      instruction: 'براہ کرم اپنی انگلی یا ماؤس سے باکس میں دستخط کریں',
      guardianLabel: 'قانونی سرپرست کا نام',
      clear: 'صاف کریں',
      cancel: 'منسوخ کریں',
      confirm: 'تصدیق کریں اور جمع کرائیں'
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.ca;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.instruction}>{t.instruction}</p>
        
        <div className={styles.guardianInfo}>
          <strong>{t.guardianLabel}:</strong> {guardianName}
        </div>

        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div className={styles.actions}>
          <button 
            type="button"
            className={styles.clearButton} 
            onClick={clearSignature}
          >
            {t.clear}
          </button>
          <button 
            type="button"
            className={styles.cancelButton} 
            onClick={onClose}
          >
            {t.cancel}
          </button>
          <button 
            type="button"
            className={styles.confirmButton} 
            onClick={handleConfirm}
            disabled={!hasSignature}
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
