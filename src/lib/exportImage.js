import html2canvas from 'html2canvas'

/**
 * @param {HTMLElement} node      
  @param {string}      fileName  
 */
export async function exportNodeToPng(node, fileName = 'lspd-case-file.png') {
  if (!node) throw new Error('Preview node was not found.')

  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready
    } catch {
    }
  }

  const canvas = await html2canvas(node, {
    backgroundColor: '#0f172a',
    scale: 3,
    useCORS: true,
    imageTimeout: 15000,
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  })

  const dataUrl = canvas.toDataURL('image/png', 1.0)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName.toLowerCase().endsWith('.png') ? fileName : `${fileName}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
