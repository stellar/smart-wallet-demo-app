import { Button, Text, Icon, CopyText } from '@stellar/design-system'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'

export type ModalProps = {
  title?: {
    text: string
    image?: {
      source?: string | React.ReactNode | 'blank-space'
      variant?: 'sm' | 'md' | 'lg'
    }
  }
  description?: string
  backgroundImageUri?: string
  button?: React.ComponentProps<typeof Button>
  onClose?: () => void
  children?: React.ReactNode
  variant?: 'default' | 'transaction'
  transaction?: {
    hash: string
    type: string
    vendor: string
    amount: string
    asset: string
    date: string
  }
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  backgroundImageUri,
  button,
  onClose,
  children,
  variant = 'default',
  transaction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const imageSizeMap = {
    sm: 'h-[80px] w-[80px]',
    md: 'h-[130px] w-[130px]',
    lg: 'h-[180px] w-[180px]',
  }

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatAmount = (amount: string, asset: string) => {
    const numAmount = parseFloat(amount)
    const formattedAmount = numAmount.toLocaleString()
    return `${formattedAmount} ${asset}`
  }

  const truncateHash = (hash: string) => {
    if (hash.length <= 20) return hash
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`
  }

  const renderImage = (image: NonNullable<ModalProps['title']>['image']) => {
    if (!image) return null

    if (image.source === 'blank-space') {
      return <div className={imageSizeMap[image.variant ?? 'md']} />
    }

    if (typeof image.source === 'string') {
      return (
        <img
          src={image.source}
          alt="Modal image"
          className={clsx('object-cover rounded-full', imageSizeMap[image.variant ?? 'md'])}
        />
      )
    }

    return <div className={clsx(imageSizeMap[image.variant ?? 'md'])}>{image.source}</div>
  }

  // Render modal content based on variant
  const renderContent = () => {
    if (variant === 'transaction' && transaction) {
      return (
        <div className="flex flex-col">
          {/* Top Section with Date, Type, and Amount */}
          <div className="pt-8 pb-6 px-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full border w-[111px] h-[22px] bg-[#F3F3F3] border-[#E2E2E2]">
                  <Text
                    as="div"
                    size="sm"
                    className="text-center text-[#6F6F6F] w-[99px] h-[18px] font-inter font-semibold text-xs leading-[18px]"
                  >
                    {formatDate(transaction.date)}
                  </Text>
                </div>
              </div>
              <div className="flex flex-col items-center mb-3 w-[322px] h-[26px] gap-1">
                <Text
                  as="div"
                  size="lg"
                  className="text-center text-[#6F6F6F] w-[322px] h-[26px] font-inter font-medium text-lg leading-[26px]"
                >
                  {transaction.type === 'CREDIT' ? 'XLM Airdrop' : transaction.vendor}
                </Text>
              </div>
              <Text
                as="div"
                size="xl"
                className="text-center text-[#171717] w-[322px] h-[32px] font-inter font-semibold text-2xl leading-[32px] tracking-tight"
              >
                {formatAmount(transaction.amount, transaction.asset)}
              </Text>
            </div>
          </div>

          {/* Transaction ID Section */}
          <div className="px-6 pb-8">
            <div className="flex flex-col items-start w-[322px] h-[72px] gap-2">
              {/* Label */}
              <div className="flex flex-row items-center w-[97px] h-[20px] gap-1">
                <Text
                  as="div"
                  size="sm"
                  className="text-[#6F6F6F] w-[97px] h-[20px] font-inter font-medium text-sm leading-[20px]"
                >
                  Transaction ID
                </Text>
              </div>

              {/* Input Field */}
              <div className="flex flex-row items-start rounded-lg w-[322px] h-[44px] p-0">
                <div className="flex flex-row items-center w-[322px] h-[44px] py-2 gap-2">
                  <Text
                    as="div"
                    size="md"
                    className="text-[#171717] w-[286px] h-[24px] font-inter font-normal text-base leading-[24px]"
                  >
                    {truncateHash(transaction.hash)}
                  </Text>

                  {/* Copy Button */}
                  <CopyText textToCopy={transaction.hash} title="Copy transaction ID">
                    <button className="flex flex-row justify-center items-center rounded-full border w-[28px] h-[28px] px-2 py-1 gap-1 bg-[#F3F3F3] border-[#E2E2E2]">
                      <Icon.Copy01 width={12} height={12} className="text-[#8F8F8F]" />
                    </button>
                  </CopyText>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="px-6 pb-8">
            <Button
              variant="primary"
              size="lg"
              isRounded={true}
              onClick={onClose}
              className="w-full h-12 text-base bg-black text-white hover:bg-gray-800 rounded-full"
            >
              Close
            </Button>
          </div>
        </div>
      )
    }

    // Default variant content
    if (children) {
      return children
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Image */}
        {title?.image && <div className="flex justify-center">{renderImage(title.image)}</div>}

        <div className="flex flex-col gap-2">
          {/* Title */}
          {title && (
            <div className="text-center">
              <Text as="h2" size="lg" weight="bold" style={{ fontSize: '1.75rem' }}>
                {title.text}
              </Text>
            </div>
          )}

          {/* Description */}
          {description && (
            <Text addlClassName="text-center" as="p" size="md">
              {description}
            </Text>
          )}
        </div>

        {/* Action Button */}
        {button && (
          <div className="flex justify-center">
            <Button {...button} />
          </div>
        )}
      </div>
    )
  }

  // Determine modal container classes and styles
  const getModalContainerProps = () => {
    const baseClasses = 'relative w-full mx-4 max-w-md rounded-2xl shadow-xl overflow-hidden'

    if (variant === 'transaction' && transaction?.type === 'CREDIT') {
      return {
        className: clsx(baseClasses, 'bg-transparent'),
        style: {
          backgroundImage: `url(${backgroundImageUri})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        },
      }
    }

    return {
      className: clsx(baseClasses, 'p-6 bg-backgroundSecondary'),
      style: backgroundImageUri
        ? {
            backgroundImage: `url(${backgroundImageUri})`,
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }
        : undefined,
    }
  }

  const containerProps = getModalContainerProps()

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} {...containerProps} className="relative">
        {/* Close Button - Inside Modal with Negative Top */}
        <button
          onClick={onClose}
          className="absolute z-50 rounded-full flex items-center justify-center transition-colors"
          style={{
            width: '28px',
            height: '28px',
            top: '-40px',
            right: '0',
            background: '#171717',
            opacity: 0.5,
            border: '1px solid #E2E2E2',
            borderRadius: '100px',
            padding: '4px 8px',
            gap: '4px',
          }}
        >
          <Icon.X width={12} height={12} className="text-white" />
        </button>

        {renderContent()}
      </div>
    </div>
  )
}
