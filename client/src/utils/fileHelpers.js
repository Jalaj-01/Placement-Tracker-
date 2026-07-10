/**
 * Helper to safely open Base64 or HTTP/HTTPS URLs in a new browser tab.
 * Modern browsers block top-level data: URI navigations, so Base64 strings
 * are converted to local Blob URLs before window.open is called.
 */
export function openFileInNewTab(url, mimeType = '') {
  if (!url) return

  // If it's a standard web link, open directly
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  // Parse and convert Base64 to Blob URL
  try {
    const parts = url.split(';base64,')
    const contentType = mimeType || parts[0].split(':')[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length
    const uInt8Array = new Uint8Array(rawLength)
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }
    
    const blob = new Blob([uInt8Array], { type: contentType })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch (e) {
    console.error('Failed to open base64 file via Blob, using iframe fallback:', e)
    
    // Iframe fallback for legacy environments
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${url}" frameborder="0" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;" allowfullscreen></iframe>`
      )
      newWindow.document.close()
    }
  }
}
