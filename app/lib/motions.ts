import { type MotionProps } from 'framer-motion'

export const MOTION_EMOJI = () => {
  return {
    initial: { opacity: 0, rotate: 45 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 45 },
    transition: { type: 'spring', stiffness: 300, damping: 20, mass: 2 },
  } satisfies MotionProps
}
