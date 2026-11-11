/**
 * BarcodeReceiver.tsx
 * Dedicated auto-focus hidden barcode receiver for physical USB/Wireless scanner guns
 * Guarantees barcodes are captured in any state (interactive or non-interactive)
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Product } from '../../types';
import { sound } from '../../services/sound';
import { findProductByBarcode, normalizeBarcodeInput } from '../../utils/formatters';

interface BarcodeReceiverProps {
  products: Product[];
  onProductScanned: (product: Product) => void;
  onScanError?: (barcode: string) => void;
  isModalOpen: boolean;
}

const BARCODE_RECEIVER_ID = 'pos-barcode-hidden-receiver-input';

export const BarcodeReceiver: React.FC<BarcodeReceiverProps> = ({
  products,
  onProductScanned,
  onScanError,
  isModalOpen,
}) => {
  // Constant ID state for the barcode receiver input element
  const [receiverId] = useState<string>(BARCODE_RECEIVER_ID);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [scanValue, setScanValue] = useState('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const windowBufferRef = useRef<string>('');

  // Function to safely refocus hidden input by ID and ref if no other interactive input is focused
  const ensureFocus = useCallback(() => {
    if (isModalOpen) return;
    const active = document.activeElement;
    const isTyping =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement ||
      active?.getAttribute('contenteditable') === 'true';

    // Locate target input by ID or ref
    const targetEl =
      hiddenInputRef.current ||
      (document.getElementById(receiverId) as HTMLInputElement | null);

    // If cashier is typing in a real search input or modal input, don't steal focus
    if ((!isTyping || active === targetEl) && targetEl) {
      targetEl.focus({ preventScroll: true });
      setIsFocused(true);
    }
  }, [isModalOpen, receiverId]);

  // 1. Initial focus on mount using useEffect and ID
  useEffect(() => {
    ensureFocus();
    const timer = setTimeout(ensureFocus, 100);
    return () => clearTimeout(timer);
  }, [ensureFocus]);

  // 2. Refocus whenever modals close
  useEffect(() => {
    if (!isModalOpen) {
      const timer = setTimeout(ensureFocus, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, ensureFocus]);

  // 3. Auto-refocus on loss of focus (blur), window focus, click, and touch
  useEffect(() => {
    const handleRefocus = () => {
      setTimeout(ensureFocus, 50);
    };

    const handleUserInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const clickedInteractive =
        target?.closest('input, textarea, select, [contenteditable="true"], button, a');

      // If user clicked general background or cards, refocus barcode input
      if (!clickedInteractive) {
        ensureFocus();
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('focus', handleRefocus);
    window.addEventListener('blur', handleRefocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        ensureFocus();
      }
    });

    // Periodic safety check to keep scanner receiver permanently ready
    const interval = setInterval(() => {
      ensureFocus();
    }, 1500);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('focus', handleRefocus);
      window.removeEventListener('blur', handleRefocus);
      clearInterval(interval);
    };
  }, [ensureFocus]);

  // Process and match scanned barcode
  const processBarcode = useCallback(
    (rawCode: string) => {
      const clean = normalizeBarcodeInput(rawCode);
      if (!clean || clean.length < 2) return;

      const matched = findProductByBarcode(products, clean);
      if (matched) {
        sound.playScanBeep();
        onProductScanned(matched);
      } else {
        sound.playError();
        if (onScanError) {
          onScanError(clean);
        }
      }
    },
    [products, onProductScanned, onScanError]
  );

  // Hidden Input Event Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = scanValue.trim();
      if (code) {
        processBarcode(code);
        setScanValue('');
      }
    }
  };

  // 3. Fallback Global Keyboard Capture (Dual-Layer)
  // In case the hidden input somehow lost focus, window listener catches keystrokes
  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // If user is currently typing in an input other than our hidden input, let it type
      if (
        (active instanceof HTMLInputElement && active !== hiddenInputRef.current) ||
        active instanceof HTMLTextAreaElement
      ) {
        // If Enter is pressed inside another input (like search), let that component handle it
        return;
      }

      const now = Date.now();
      // Hardware scanners typically burst keys in under 150ms per key
      if (now - lastKeyTimeRef.current > 400) {
        windowBufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const buffered = windowBufferRef.current.trim();
        if (buffered && buffered.length >= 2) {
          e.preventDefault();
          processBarcode(buffered);
          windowBufferRef.current = '';
          setScanValue('');
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        windowBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown, true);
    return () => window.removeEventListener('keydown', handleWindowKeyDown, true);
  }, [processBarcode]);

  return (
    <>
      {/* Hidden auto-focus input with fixed ID, focused via useEffect and on blur */}
      <input
        ref={hiddenInputRef}
        id={receiverId}
        type="text"
        value={scanValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          // Auto-refocus on blur to ensure continuous barcode scanner responsiveness
          setTimeout(ensureFocus, 50);
        }}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="fixed -top-96 -left-96 w-1 h-1 opacity-0 pointer-events-none -z-50"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
};
