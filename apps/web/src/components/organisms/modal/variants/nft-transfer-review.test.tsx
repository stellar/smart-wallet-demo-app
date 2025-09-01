import { render, screen } from 'src/helpers/tests'

import { ModalNftTransferReview, ModalNftTransferReviewProps } from './nft-transfer-review'

describe('ModalNftTransferReview', () => {
  const defaultProps: ModalNftTransferReviewProps = {
    variant: 'nft-transfer-review',
    nfts: [
      {
        id: '1',
        name: 'Test NFT 1',
        url: 'test1.jpg',
        token_id: '',
        description: '',
        transaction_hash: '',
      },
      {
        id: '2',
        name: 'Test NFT 2',
        url: 'test2.jpg',
        token_id: '',
        description: '',
        transaction_hash: '',
      },
    ],
    destinationAddress: 'GBN6N2NC...7ZS3L507',
    title: 'Review Transfer',
    toLabel: 'To',
    copyAddressTitle: 'Copy Address',
    disclaimer: 'Please review the transfer details before confirming.',
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
    expect(screen.getByText('GBN6N2NC...7ZS3L507')).toBeInTheDocument()
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
