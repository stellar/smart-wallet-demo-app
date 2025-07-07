import { InviteTemplate } from './template'

export function Invite() {
  const onNext = () => {
    // Logic to handle the next step in the onboarding process
    console.log('Next step in onboarding')
  }

  return <InviteTemplate onNext={onNext} />
}
