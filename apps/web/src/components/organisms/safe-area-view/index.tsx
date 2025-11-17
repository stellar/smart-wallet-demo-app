import clsx from 'clsx'

type SafeAreaViewProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ children, className = '', ...rest }) => {
  return (
    <div className={clsx('py-8', 'px-4', className)} {...rest}>
      {children}
    </div>
  )
}
