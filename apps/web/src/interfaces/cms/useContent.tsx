import contentExample from 'src/config/content.example.json'
import content from 'src/config/content.json'

type ContentKeys = keyof typeof contentExample

export const useContent = () => {
  return (key: ContentKeys): string => content[key] || ''
}

// Static helper
export const c = (key: ContentKeys): string => content[key] || ''
