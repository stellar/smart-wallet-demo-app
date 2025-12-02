import contentExample from 'src/config/content.example.json'
import content from 'src/config/content.json'

type ContentKeys = keyof typeof contentExample

export const useContent = () => {
  return (key: ContentKeys): string => {
    const contentValue = content[key as keyof typeof content]
    return contentValue !== undefined ? contentValue : contentExample[key] || ''
  }
}

// Static helper
export const c = (key: ContentKeys): string => {
  const contentValue = content[key as keyof typeof content]
  return contentValue !== undefined ? contentValue : contentExample[key] || ''
}
