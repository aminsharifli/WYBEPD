const SLIDER_URL = 'https://6a96b37d0e3240db90614f54.mockapi.io/LSPD/slider'

async function request(url = SLIDER_URL, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`Slider isteği başarısız oldu (${response.status}).`)
  return response.json()
}

export const listSlides = () => request()
export const addSlide = (photo) => request(SLIDER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo }) })
export const deleteSlide = (id) => request(`${SLIDER_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })

export function compressSlideImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Şəkil faylı oxuna bilmədi.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Şəkil faylı açıla bilmədi.'))
      image.onload = () => {
        const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
