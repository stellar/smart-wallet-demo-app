import sgMail, { MailService } from '@sendgrid/mail'

import { SingletonBase } from 'api/core/framework/singleton/interface'
import { getValueFromEnv } from 'config/env-utils'
import { logger } from 'config/logger'

import { EmailData, IEmailService } from '../types'

export class SendGridService extends SingletonBase implements IEmailService {
  private sender: string
  private sendgridMail: MailService

  constructor(sender?: string) {
    super()
    this.sendgridMail = sgMail
    this.sendgridMail.setApiKey(getValueFromEnv('TWILIO_SENDGRID_API_KEY'))
    this.sender = sender || getValueFromEnv('TWILIO_SENDGRID_SENDER_ADDRESS', 'noreply@example.com')
  }

  /**
   * Sends an email using Twilio SendGrid.
   *
   * @param data - The email data containing recipient(s), subject, text content,
   *               optional HTML content, and optional attachments.
   * @throws Will log and rethrow any error encountered during the sending process.
   */

  async sendEmail(data: EmailData): Promise<void> {
    try {
      const formattedData = {
        ...data,
        from: this.sender,
        replyTo: this.sender,
      }

      await this.sendgridMail.send(formattedData)
    } catch (error) {
      logger.error(error, 'SendGrid - Error sending email')
      throw error
    }
  }
}
