interface TransferAssetsTemplateProps {
  onTransfer: () => Promise<void>
}

export const TransferAssetsTemplate = ({ onTransfer }: TransferAssetsTemplateProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Transfer Assets</h3>
        <p className="text-gray-600">Template for asset transfer</p>
      </div>
    </div>
  )
}

export default TransferAssetsTemplate
