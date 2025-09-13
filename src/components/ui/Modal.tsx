import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface Modal {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
  maxHeight?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  customHeader?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  scrollable?: boolean;
  zIndex?: string;
  contentPadding?: string;
  preventBodyScroll?: boolean;
}

export const Modal: React.FC<Modal> = ({
  isOpen,
  onClose,
  title,
  children,
  subtitle,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]',
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  customHeader,
  footer,
  className = '',
  overlayClassName = '',
  scrollable = true,
  zIndex = 'z-50',
  contentPadding = 'p-6',
  preventBodyScroll = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventBodyScroll]);

  // Handle outside click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === overlayRef.current) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center ${contentPadding} ${zIndex} ${overlayClassName}`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`bg-white rounded-xl shadow-2xl ${maxWidth} w-full ${maxHeight} ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {customHeader || (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};