import clsx from 'clsx'
import { useEffect } from 'react'

import { NavigateButton } from 'src/components/molecules'
import { SafeAreaView } from 'src/components/organisms'
import { qrScanner } from 'src/interfaces/qr-scanner'

import styles from './styles.module.css'

type Props = {
  onGoBack: () => void
  onScan: (decodedText: string) => Promise<void> | void
}

export const ScanTemplate = ({ onGoBack, onScan }: Props) => {
  useEffect(() => {
    qrScanner.start(decoded => onScan(decoded))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SafeAreaView>
      <NavigateButton className="absolute" variant="secondary" onClick={onGoBack} />

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div className="relative w-full h-full overflow-hidden">
          {/* Layer 0: Background */}
          <div className="absolute inset-0 bg-transparent z-[-3]" />

          {/* Layer 1: Content under the cutout */}
          <div className="absolute z-[-2] inset-0">
            <div id={qrScanner.getElementId()} className="flex flex-col h-full w-screen justify-center" />
          </div>

          {/* Layer 2: Overlay with transparent hole */}
          <div className="absolute inset-0 z-[-1]">
            <div className={clsx('border-2', 'border-whitish', styles.cutout)} />
          </div>
        </div>
      </div>
    </SafeAreaView>
  )
}
