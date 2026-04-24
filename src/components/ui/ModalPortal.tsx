import { createPortal } from 'react-dom';
import React from 'react';

export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  return createPortal(children, document.body);
}
