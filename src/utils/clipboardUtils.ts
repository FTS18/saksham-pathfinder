/**
 * Robust clipboard copy utility that handles various edge cases
 * Falls back to legacy method if modern API fails
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern API - preferred
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts or older browsers
      return copyToClipboardLegacy(text);
    }
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    // Try legacy method as fallback
    return copyToClipboardLegacy(text);
  }
};

/**
 * Legacy clipboard copy using textarea element
 * Works even when modern API is unavailable
 */
const copyToClipboardLegacy = (text: string): boolean => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);

    // Focus and select
    textarea.focus();
    textarea.select();

    // Try to copy
    const successful = document.execCommand('copy');

    // Cleanup
    document.body.removeChild(textarea);

    return successful;
  } catch (error) {
    console.error('Legacy clipboard copy failed:', error);
    return false;
  }
};

/**
 * Share using Web Share API if available, otherwise fallback to alternatives
 */
export const shareContent = async (shareData: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title || ''}\n${shareData.text || ''}\n${shareData.url || ''}`;
      return await copyToClipboard(text);
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled share
      return false;
    }
    console.error('Share failed:', error);
    return false;
  }
};
