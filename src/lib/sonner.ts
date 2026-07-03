/**
 * Shared sonner re-export.
 * Forces a single module instance across all chunks
 * (fixes dynamic-import deduplication issue with Toaster).
 */
export { toast, Toaster, type ToastT } from 'sonner';