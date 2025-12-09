/**
 * Utility to clear text selection after paste events
 * Fixes mobile issue where paste keeps selection active and prevents button clicks
 */

export function clearTextSelection() {
  // Clear any active text selection
  if (window.getSelection) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}

/**
 * Handler for paste events that automatically clears selection after paste
 * Use this on input/textarea elements to fix mobile paste issues
 */
export function handlePasteWithClear(callback?: (e: ClipboardEvent) => void) {
  return (e: ClipboardEvent) => {
    // Call custom callback if provided
    if (callback) {
      callback(e)
    }

    // Clear selection after a short delay to ensure paste is complete
    setTimeout(() => {
      clearTextSelection()
    }, 100)
  }
}

/**
 * React hook for adding paste handlers to refs
 */
export function useClearSelectionOnPaste() {
  return {
    onPaste: (e: React.ClipboardEvent) => {
      setTimeout(() => {
        clearTextSelection()
      }, 100)
    },
    onBlur: () => {
      // Also clear on blur to ensure no lingering selection
      clearTextSelection()
    }
  }
}
