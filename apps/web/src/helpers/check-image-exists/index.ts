export function checkImageExists(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Image not found'))
  })
}
