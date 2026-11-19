import { Accessible } from './Accessible'
import { AnnotatedRun } from './AnnotatedRun'
import { Closing } from './Closing'
import { Hero } from './Hero'

export function Landing() {
  return (
    <>
      <Hero />
      <AnnotatedRun />
      <Accessible />
      <Closing />
    </>
  )
}
