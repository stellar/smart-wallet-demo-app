import contentExample from 'src/config/content.example.json'
import content from 'src/config/content.json'

type ContentKeys = keyof typeof contentExample

export const useContent = () => {
  return (key: ContentKeys): string => {
    return content[key as keyof typeof content] || contentExample[key] || ''
  }
}

// Static helper
export const c = (key: ContentKeys): string => {
  return content[key as keyof typeof content] || contentExample[key] || ''
}
