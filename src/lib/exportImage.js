import html2canvas from 'html2canvas'

const colorCanvas = document.createElement('canvas')
colorCanvas.width = 1
colorCanvas.height = 1
const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true })
const normalizedColorCache = new Map()

function normalizeColorFunctions(value) {
  if (!value?.includes('color(')) return value
  if (!colorContext) return value
  return value.replace(/color\([^)]*\)/gi, (color) => {
    if (normalizedColorCache.has(color)) return normalizedColorCache.get(color)
    colorContext.fillStyle = '#010203'
    colorContext.fillStyle = color
    if (colorContext.fillStyle === '#010203' || colorContext.fillStyle === 'rgb(1, 2, 3)') {
      const srgb = color.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i)
      if (!srgb) {
        normalizedColorCache.set(color, '#808080')
        return '#808080'
      }
      const channel = (number) => Math.round(Math.max(0, Math.min(1, Number(number))) * 255)
      const alpha = srgb[4] ? (srgb[4].endsWith('%') ? Number(srgb[4].slice(0, -1)) / 100 : Number(srgb[4])) : 1
      const result = `rgba(${channel(srgb[1])}, ${channel(srgb[2])}, ${channel(srgb[3])}, ${alpha})`
      normalizedColorCache.set(color, result)
      return result
    }
    colorContext.clearRect(0, 0, 1, 1)
    colorContext.fillRect(0, 0, 1, 1)
    const [red, green, blue, alpha] = colorContext.getImageData(0, 0, 1, 1).data
    const result = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`
    normalizedColorCache.set(color, result)
    return result
  })
}

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

  await Promise.all(Array.from(node.querySelectorAll('img')).map((image) => {
    if (image.complete) return Promise.resolve()
    return new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }) })
  }))

  const width = Math.max(1, node.scrollWidth)
  const height = Math.max(1, node.scrollHeight)
  const scale = Math.min(2, Math.sqrt(12_000_000 / (width * height)))
  const captureId = `png-capture-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const previousId = node.getAttribute('data-png-capture')
  node.setAttribute('data-png-capture', captureId)
  let canvas
  try {
    canvas = await html2canvas(node, {
    backgroundColor: '#111923',
    scale,
    useCORS: true,
    imageTimeout: 15000,
    logging: false,
    width,
    height,
    onclone: (clonedDocument) => {
      const clonedNode = clonedDocument.querySelector(`[data-png-capture="${captureId}"]`)
      if (!clonedNode) return
      const sourceElements = [node, ...node.querySelectorAll('*')]
      const clonedElements = [clonedNode, ...clonedNode.querySelectorAll('*')]
      sourceElements.forEach((source, index) => {
        const target = clonedElements[index]
        if (!target) return
        const computed = getComputedStyle(source)
        for (let property = 0; property < computed.length; property += 1) {
          const name = computed[property]
          const value = computed.getPropertyValue(name)
          if (value.includes('color(')) target.style.setProperty(name, normalizeColorFunctions(value), 'important')
        }
      })
    },
  })
  } finally {
    if (previousId === null) node.removeAttribute('data-png-capture')
    else node.setAttribute('data-png-capture', previousId)
  }

  const blob = await new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG görüntüsü oluşturulamadı.')), 'image/png'))
  const link = document.createElement('a')
  const objectUrl = URL.createObjectURL(blob)
  link.href = objectUrl
  link.download = fileName.toLowerCase().endsWith('.png') ? fileName : `${fileName}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
