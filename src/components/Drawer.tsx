import { useEffect, useRef, type ReactNode } from 'react';
import { IconClose } from './Icons';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  title: string;
  /** Replaces the default title bar (the close button is always rendered). */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Off-canvas panel used by the menu, filters and bag. Stays mounted so it can
 * animate, and is `inert` while closed so it is skipped by keyboard and
 * assistive tech.
 */
export function Drawer({ open, onClose, side, title, header, footer, children }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={`drawer drawer--${side}${open ? ' is-open' : ''}`} inert={!open}>
      <div className="drawer__overlay" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className={`drawer__header${header ? ' drawer__header--custom' : ''}`}>
          {header ?? <h2 className="drawer__title">{title}</h2>}
          <button
            ref={closeRef}
            type="button"
            className="icon-btn drawer__close"
            onClick={onClose}
            aria-label={`Tutup ${title.toLowerCase()}`}
          >
            <IconClose />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__footer">{footer}</div>}
      </aside>
    </div>
  );
}
