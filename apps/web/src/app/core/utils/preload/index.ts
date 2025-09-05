export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

export const preloadAudio = (urls: string[]) => {
  urls.forEach(url => {
    const audio = new Audio()
    audio.src = url
  })
}
