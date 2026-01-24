import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  ignoreInput?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, ignoreInput = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input/textarea
      if (ignoreInput) {
        const target = event.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        const isContentEditable = target.isContentEditable;
        if (isInput || isContentEditable) return;
      }

      for (const shortcut of shortcuts) {
        const { key, ctrl = false, shift = false, alt = false, action } = shortcut;

        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          action();
          break;
        }
      }
    },
    [shortcuts, enabled, ignoreInput]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Default shortcuts for admin panel
export function useAdminKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      action: () => router.push('/admin/products/new'),
      description: 'New Product',
    },
    {
      key: 'o',
      action: () => router.push('/admin/orders'),
      description: 'Orders',
    },
    {
      key: 'c',
      action: () => router.push('/admin/customers'),
      description: 'Customers',
    },
    {
      key: 'i',
      action: () => router.push('/admin/inventory'),
      description: 'Inventory',
    },
    {
      key: 'd',
      action: () => router.push('/admin'),
      description: 'Dashboard',
    },
    {
      key: 'e',
      ctrl: true,
      action: () => {
        const event = new CustomEvent('admin:export');
        window.dispatchEvent(event);
      },
      description: 'Export Data (triggers export on current page)',
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]');
        searchInput?.focus();
      },
      description: 'Focus Search',
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals/dialogs
        const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
        dialog?.close();
      },
      description: 'Close Modal',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

// Toast notification helper for keyboard shortcuts
export function showShortcutToast(description: string) {
  toast(`⌨️ ${description}`, {
    icon: '⌨️',
    duration: 1000,
    style: {
      background: '#1e293b',
      color: '#fff',
    },
  });
}

// Composable hook for page-specific shortcuts
export function usePageShortcuts(
  pageShortcuts: Omit<KeyboardShortcut, 'description'>[],
  pageDescription: string
) {
  const shortcuts: KeyboardShortcut[] = pageShortcuts.map((s) => ({
    ...s,
    description: pageDescription,
  }));

  useKeyboardShortcuts(shortcuts);
}
