const SLIDER_URL = 'https://6a96b37d0e3240db90614f54.mockapi.io/LSPD/slider'

async function request(url = SLIDER_URL, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`Slider isteği başarısız oldu (${response.status}).`)
  return response.json()
}

export const listSlides = () => request()
export const addSlide = (photo) => request(SLIDER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo }) })
export const deleteSlide = (id) => request(`${SLIDER_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
