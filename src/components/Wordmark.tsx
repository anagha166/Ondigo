type WordmarkProps = {
  size?: 'sm' | 'md' | 'xl'
}

const SIZE = {
  sm: 'text-xl',
  md: 'text-3xl',
  xl: 'text-7xl leading-none sm:text-8xl',
} as const

export function Wordmark({ size = 'md' }: WordmarkProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight lowercase ${SIZE[size]}`}
      aria-label="Ondigo"
    >
      <span className="text-glow" aria-hidden>
        on
      </span>
      <span aria-hidden>digo</span>
    </span>
  )
}
