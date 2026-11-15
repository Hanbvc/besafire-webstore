import { useEffect } from 'react';
import site from '../data/site.json';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${site.brand}` : site.brand;
  }, [title]);
}
