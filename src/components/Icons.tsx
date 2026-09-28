import type { SVGProps } from 'react'
import type { TripCategory } from '../types'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function BeachIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <circle cx="12" cy="10" r="3.2" />
      <path d="M12 4.5 V6.2" />
      <path d="M12 13.8 V15.5" />
      <path d="M6.5 10 H8.2" />
      <path d="M15.8 10 H17.5" />
      <path d="M8.1 6.1 L9.3 7.3" />
      <path d="M14.7 12.7 L15.9 13.9" />
      <path d="M15.9 6.1 L14.7 7.3" />
      <path d="M9.3 12.7 L8.1 13.9" />
      <path d="M4 18 C7 16.2, 10 16.2, 12 18 C14 16.2, 17 16.2, 20 18" />
    </svg>
  )
}

export function CityIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 19 V10 L9 7 V19" />
      <path d="M9 19 V8 H15 V19" />
      <path d="M15 19 V11 H19 V19" />
      <path d="M4 19 H20" />
    </svg>
  )
}

export function MountainsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M3.5 18 L9 8 L13.2 14.5" />
      <path d="M10.5 18 L15 10 L20.5 18" />
    </svg>
  )
}

export function NatureIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M12 20 V11" />
      <path d="M12 14 C8 14, 6.5 10.5, 9 8 C10 10.5, 12 11, 12 11" />
      <path d="M12 14 C16 14, 17.5 10.5, 15 8 C14 10.5, 12 11, 12 11" />
      <path d="M12 11 C10.5 7.5, 12 4.5, 12 4.5 C12 4.5, 13.5 7.5, 12 11" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="6" y="11" width="12" height="9" rx="1.5" />
      <path d="M8.5 11 V8 A3.5 3.5 0 0 1 15.5 8 V11" />
    </svg>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M14 6 L8 12 L14 18" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10 H20" />
      <path d="M8 3.5 V7" />
      <path d="M16 3.5 V7" />
    </svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base} {...props}>
      <path d="M5 5.5 C8 4.5, 10 5, 12 6.5 C14 5, 16 4.5, 19 5.5 V18 C16 17, 14 17.5, 12 19 C10 17.5, 8 17, 5 18 Z" />
      <path d="M12 6.5 V19" />
    </svg>
  )
}

export function CategoryIcon({
  category,
  ...props
}: IconProps & { category: TripCategory }) {
  if (category === 'beach') return <BeachIcon {...props} />
  if (category === 'city') return <CityIcon {...props} />
  if (category === 'mountains') return <MountainsIcon {...props} />
  return <NatureIcon {...props} />
}
