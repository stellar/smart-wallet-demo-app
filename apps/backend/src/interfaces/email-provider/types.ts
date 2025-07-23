export type EmailData = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  attachments?: {
    content: string
    filename: string
    type: string // e.g., 'application/pdf'
    disposition?: string // e.g., 'attachment'
  }[]
}

export interface IEmailService {
  sendEmail(data: EmailData): Promise<void>
}
