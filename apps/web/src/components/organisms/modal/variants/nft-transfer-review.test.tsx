import { render, screen, fireEvent } from 'src/helpers/tests'

import { ModalNftTransferReview, ModalNftTransferReviewProps } from './nft-transfer-review'

describe('ModalNftTransferReview', () => {
  const defaultProps: ModalNftTransferReviewProps = {
    variant: 'nft-transfer-review',
    nfts: [
      { id: '1', name: 'Test NFT 1', imageUri: 'test1.jpg' },
      { id: '2', name: 'Test NFT 2', imageUri: 'test2.jpg' },
    ],
    destinationAddress: 'GBN6N2N...7ZS3L507',
    button: {
      children: 'Confirm Transfer',
      onClick: vi.fn(),
      variant: 'primary',
      size: 'lg',
    },
  }

  it('renders title correctly', () => {
    render(<ModalNftTransferReview {...defaultProps} />)
    expect(screen.getByText('Review Transfer')).toBeInTheDocument()
  })

  it('renders NFT names', () => {
    render(<ModalNftTransferReview {...defaultProps} />)
    expect(screen.getByText('Test NFT 1')).toBeInTheDocument()
    expect(screen.getByText('Test NFT 2')).toBeInTheDocument()
  })

  it('renders destination address', () => {
    render(<ModalNftTransferReview {...defaultProps} />)
    expect(screen.getByText('GBN6N2N...7ZS3L507')).toBeInTheDocument()
  })

  it('renders confirm button', () => {
    render(<ModalNftTransferReview {...defaultProps} />)
    expect(screen.getByRole('button', { name: /confirm transfer/i })).toBeInTheDocument()
  })

  it('shows carousel indicators for multiple NFTs', () => {
    render(<ModalNftTransferReview {...defaultProps} />)
    const indicators = document.querySelectorAll('.w-2.h-2.rounded-full')
    expect(indicators.length).toBe(2)
  })
})
