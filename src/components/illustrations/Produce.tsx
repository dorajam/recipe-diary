// Produce doodle library — Sketch style (wobbly, double-stroked notebook drawings).
// Ported from Trattoria v2 design system.

const INK = '#1F1208'
const LEAF = '#5E7F2A'

interface DoodleProps {
  size?: number
  color?: string
  className?: string
}

export const Tomato = ({ size = 48, color = '#FF2D1A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 19 C 23 19, 15 26, 15 36 C 15 46, 23 53, 32 53 C 41 53, 49 46, 49 36 C 49 27, 42 19, 32 19 Z" fill={color} opacity=".95"/>
    <path d="M32 18 C 22 18, 14 26, 14 36 C 14 46, 22 54, 32 54 C 42 54, 50 47, 50 36 C 50 26, 42 18, 32 18" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33 18 C 23 19, 15 27, 15 36 C 16 47, 23 53, 31 54" stroke={INK} strokeWidth=".7" fill="none" strokeLinecap="round" opacity=".5"/>
    <path d="M40 30 L 43 33 M41 34 L 44 37 M42 38 L 45 41 M40 42 L 43 45" stroke={INK} strokeWidth=".9" opacity=".35" strokeLinecap="round"/>
    <path d="M32 18 L 27 12 L 31 14 L 35 10 L 35 14 L 39 13 L 36 18" stroke={INK} strokeWidth="1.3" fill={LEAF} strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M32 18 L 32 13" stroke={INK} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)

export const Basil = ({ size = 48, color = '#7DAD2E', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 53 C 19 47, 15 34, 22 19 C 28 13, 36 13, 42 19 C 49 33, 45 47, 32 53 Z" fill={color} opacity=".95"/>
    <path d="M32 54 C 18 48, 14 34, 22 18 C 28 12, 36 12, 42 18 C 50 32, 46 48, 32 54 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33 53 C 19 48, 15 35, 22 20" stroke={INK} strokeWidth=".6" fill="none" opacity=".45" strokeLinecap="round"/>
    <path d="M32 54 Q 30 45, 32 38 Q 30 30, 32 22 Q 31 17, 32 14" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <path d="M31 25 C 28 26, 26 28, 24 30 M31 35 C 27 36, 25 38, 22 40 M31 44 C 28 45, 26 46, 24 48 M33 28 C 36 29, 38 31, 40 33 M33 38 C 37 39, 40 41, 42 43" stroke={INK} strokeWidth=".9" fill="none" opacity=".55" strokeLinecap="round"/>
  </svg>
)

export const Lemon = ({ size = 48, color = '#FFD21A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <g transform="rotate(-18 32 32)">
      <path d="M14 32 C 14 22, 22 17, 32 17 C 42 17, 50 22, 50 32 C 50 42, 42 47, 32 47 C 22 47, 14 42, 14 32 Z" fill={color} opacity=".95"/>
      <path d="M14 32 C 14 22, 22 16, 32 16 C 42 16, 50 22, 50 32 C 50 42, 42 48, 32 48 C 22 48, 14 42, 14 32 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 32 C 12 31, 11 31, 11 32 C 11 33, 12 33, 14 32 Z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M50 32 C 52 31, 53 31, 53 32 C 53 33, 52 33, 50 32 Z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M22 26 q 1 -1 2 0 M30 22 q 1 -1 2 0 M38 26 q 1 -1 2 0 M42 34 q 1 -1 2 0 M34 38 q 1 -1 2 0 M22 38 q 1 -1 2 0" stroke={INK} strokeWidth=".9" opacity=".55" fill="none" strokeLinecap="round"/>
      <path d="M48 18 C 54 14, 58 16, 56 22 C 52 24, 49 22, 48 18 Z" fill={LEAF} stroke={INK} strokeWidth="1.3" strokeLinejoin="round"/>
    </g>
  </svg>
)

export const Pepper = ({ size = 48, color = '#FF3500', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M22 29 C 20 37, 22 46, 29 52 C 32 54, 36 53, 40 50 C 46 44, 46 35, 42 29 C 38 25, 32 25, 29 27 C 26 28, 24 28, 22 29 Z" fill={color} opacity=".95"/>
    <path d="M22 28 C 20 36, 22 46, 28 52 C 32 54, 36 54, 40 50 C 46 44, 46 34, 42 28 C 38 24, 32 24, 28 26 C 26 27, 24 27, 22 28 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 31 Q 27 40, 30 52 M38 31 Q 39 40, 36 52" stroke={INK} strokeWidth=".9" fill="none" opacity=".5" strokeLinecap="round"/>
    <path d="M32 26 L 32 19 Q 32 16, 35 16" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M30 22 C 26 20, 24 23, 27 26 C 29 26, 30 24, 30 22 Z" fill={LEAF} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
)

export const Garlic = ({ size = 48, color = '#FBE4D9', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 22 C 18 22, 12 32, 14 42 C 16 50, 22 54, 28 54 C 30 56, 34 56, 36 54 C 42 54, 48 50, 50 42 C 52 32, 46 22, 32 22 Z" fill={color} opacity=".95"/>
    <path d="M32 21 C 17 21, 10 32, 13 43 C 15 51, 21 55, 27 55 C 29 57, 35 57, 37 55 C 43 55, 49 51, 51 43 C 54 32, 47 21, 32 21 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M32 22 C 31 32, 31 46, 32 56" stroke={INK} strokeWidth="1.2" fill="none" opacity=".7" strokeLinecap="round"/>
    <path d="M25 24 C 20 32, 19 44, 24 54" stroke={INK} strokeWidth="1" fill="none" opacity=".55" strokeLinecap="round"/>
    <path d="M39 24 C 44 32, 45 44, 40 54" stroke={INK} strokeWidth="1" fill="none" opacity=".55" strokeLinecap="round"/>
    <path d="M28 22 C 30 19, 34 19, 36 22" stroke={INK} strokeWidth="1.2" fill="none" opacity=".7" strokeLinecap="round"/>
    <path d="M30 20 L 28 12 M32 20 L 33 11 M34 20 L 36 13" stroke={LEAF} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const GarlicClove = ({ size = 48, color = '#FBE4D9', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M26 18 C 22 26, 20 38, 24 48 C 28 54, 36 54, 40 48 C 44 38, 42 26, 38 18 C 34 14, 30 14, 26 18 Z" fill={color} opacity=".95"/>
    <path d="M26 17 C 22 26, 19 38, 24 49 C 28 55, 36 55, 40 49 C 45 38, 42 26, 38 17 C 34 13, 30 13, 26 17 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M28 22 C 26 32, 26 42, 28 50" stroke={INK} strokeWidth=".9" fill="none" opacity=".5" strokeLinecap="round"/>
    <path d="M22 30 C 21 36, 22 42, 24 46" stroke="#FFF" strokeOpacity=".4" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const Onion = ({ size = 48, color = '#A8326E', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 21 C 19 21, 12 31, 12 41 C 12 50, 21 56, 32 56 C 43 56, 52 50, 52 41 C 52 31, 45 21, 32 21 Z" fill={color} opacity=".95"/>
    <path d="M32 20 C 18 20, 11 31, 11 41 C 11 51, 20 57, 32 57 C 44 57, 53 51, 53 41 C 53 31, 46 20, 32 20 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M32 22 C 31 32, 31 46, 32 56 M22 26 C 18 34, 18 46, 22 54 M42 26 C 46 34, 46 46, 42 54 M16 38 C 14 41, 14 44, 16 47 M48 38 C 50 41, 50 44, 48 47" stroke={INK} strokeWidth=".9" fill="none" opacity=".5" strokeLinecap="round"/>
    <path d="M30 20 L 28 13 M32 20 L 33 11 M34 20 L 37 14" stroke={LEAF} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

export const Olive = ({ size = 48, color = '#3F1F2E', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="32" cy="36" rx="10" ry="15" fill={color} opacity=".95"/>
    <ellipse cx="32" cy="36" rx="11" ry="16" stroke={INK} strokeWidth="1.4" fill="none"/>
    <path d="M22 32 C 23 38, 23 42, 26 50" stroke="#FFF" strokeOpacity=".25" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M32 20 C 30 16, 32 12, 36 10 C 38 14, 36 18, 32 20 Z" fill={LEAF} stroke={INK} strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
)

export const Mushroom = ({ size = 48, color = '#D9A57B', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M14 32 C 14 20, 22 12, 32 12 C 42 12, 50 20, 50 32 C 50 34, 48 36, 44 36 L 20 36 C 16 36, 14 34, 14 32 Z" fill={color} opacity=".95"/>
    <path d="M14 32 C 14 20, 22 12, 32 12 C 42 12, 50 20, 50 32 C 50 34, 48 36, 44 36 L 20 36 C 16 36, 14 34, 14 32 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M24 36 C 23 44, 24 50, 26 54 L 38 54 C 40 50, 41 44, 40 36 Z" fill="#FFFAEE" opacity=".95"/>
    <path d="M24 36 C 23 44, 24 50, 26 54 L 38 54 C 40 50, 41 44, 40 36" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M26 54 L 38 54" stroke={INK} strokeWidth="1.2" opacity=".5"/>
    <ellipse cx="22" cy="24" rx="2.5" ry="1.8" fill="#FFFAEE" opacity=".7"/>
    <ellipse cx="34" cy="20" rx="3" ry="2" fill="#FFFAEE" opacity=".7"/>
    <ellipse cx="42" cy="26" rx="2" ry="1.5" fill="#FFFAEE" opacity=".7"/>
    <ellipse cx="30" cy="30" rx="1.5" ry="1.2" fill="#FFFAEE" opacity=".7"/>
  </svg>
)

export const Cheese = ({ size = 48, color = '#F5C518', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M10 46 L 50 18 L 54 30 L 14 54 Z" fill={color} opacity=".95"/>
    <path d="M10 46 L 50 18 L 54 30 L 14 54 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M50 18 L 54 30" stroke={INK} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="24" cy="40" r="2" fill={INK} opacity=".25"/>
    <circle cx="34" cy="32" r="1.6" fill={INK} opacity=".25"/>
    <circle cx="42" cy="26" r="1.4" fill={INK} opacity=".25"/>
    <circle cx="20" cy="48" r="1.2" fill={INK} opacity=".25"/>
    <path d="M16 44 q 2 -1 4 0 M28 36 q 2 -1 4 0 M38 28 q 2 -1 4 0" stroke={INK} strokeWidth=".8" fill="none" opacity=".4" strokeLinecap="round"/>
  </svg>
)

export const Espresso = ({ size = 48, color = '#FFFAEE', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="32" cy="50" rx="22" ry="4" fill={color} opacity=".95"/>
    <ellipse cx="32" cy="50" rx="22" ry="4" stroke={INK} strokeWidth="1.4" fill="none"/>
    <ellipse cx="32" cy="49" rx="18" ry="2" stroke={INK} strokeWidth="1" fill="none" opacity=".6"/>
    <path d="M18 26 C 18 24, 20 22, 22 22 L 42 22 C 44 22, 46 24, 46 26 L 44 44 C 44 46, 42 48, 40 48 L 24 48 C 22 48, 20 46, 20 44 Z" fill={color} opacity=".95"/>
    <path d="M18 26 C 18 24, 20 22, 22 22 L 42 22 C 44 22, 46 24, 46 26 L 44 44 C 44 46, 42 48, 40 48 L 24 48 C 22 48, 20 46, 20 44 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <ellipse cx="32" cy="26" rx="12" ry="3" fill="#3F1F2E"/>
    <ellipse cx="32" cy="26" rx="12" ry="3" stroke={INK} strokeWidth="1.2" fill="none"/>
    <path d="M46 28 C 52 28, 54 32, 54 36 C 54 40, 52 42, 48 42" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M26 18 q 2 -3, 0 -6 M32 16 q 2 -3, 0 -6 M38 18 q 2 -3, 0 -6" stroke={INK} strokeWidth="1.2" fill="none" opacity=".5" strokeLinecap="round"/>
  </svg>
)

export const Wine = ({ size = 48, color = '#7DAD2E', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M26 18 L 26 26 C 22 28, 20 32, 20 38 L 20 54 C 20 56, 22 58, 24 58 L 40 58 C 42 58, 44 56, 44 54 L 44 38 C 44 32, 42 28, 38 26 L 38 18 Z" fill={color} opacity=".95"/>
    <path d="M26 18 L 26 26 C 22 28, 20 32, 20 38 L 20 54 C 20 56, 22 58, 24 58 L 40 58 C 42 58, 44 56, 44 54 L 44 38 C 44 32, 42 28, 38 26 L 38 18 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <rect x="27" y="10" width="10" height="10" fill="#A0826D" stroke={INK} strokeWidth="1.4"/>
    <path d="M27 14 L 37 14" stroke={INK} strokeWidth=".9" opacity=".5"/>
    <rect x="22" y="38" width="20" height="14" fill="#FFFAEE" opacity=".9"/>
    <rect x="22" y="38" width="20" height="14" stroke={INK} strokeWidth="1.2" fill="none"/>
    <path d="M25 43 L 39 43 M25 47 L 35 47" stroke={INK} strokeWidth=".9" opacity=".5" strokeLinecap="round"/>
    <path d="M22 32 C 21 36, 21 42, 22 48" stroke="#FFF" strokeOpacity=".4" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const Whisk = ({ size = 48, color = '#C8C8C8', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M44 8 L 56 12 L 54 18 L 42 14 Z" fill="#A0826D" stroke={INK} strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M46 12 L 52 14" stroke={INK} strokeWidth=".9" opacity=".5"/>
    <path d="M42 14 L 26 38" stroke={INK} strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M26 38 C 14 38, 8 46, 12 56 C 16 56, 22 50, 26 38 Z" fill={color} opacity=".7" stroke={INK} strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M26 38 C 16 42, 14 50, 18 58 C 22 56, 26 50, 26 38" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M26 38 C 22 46, 22 54, 24 58 C 26 56, 28 50, 26 38" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M26 38 C 28 46, 30 52, 30 56" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <ellipse cx="26" cy="38" rx="3" ry="2" fill="#888" stroke={INK} strokeWidth="1.2"/>
  </svg>
)

export const PastaNest = ({ size = 48, color = '#F5C518', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="32" cy="36" rx="22" ry="14" fill={color} opacity=".95"/>
    <ellipse cx="32" cy="36" rx="22" ry="14" stroke={INK} strokeWidth="1.4" fill="none"/>
    <path d="M14 34 C 22 30, 32 28, 50 34 M16 38 C 24 34, 36 32, 48 38 M16 42 C 24 38, 36 38, 48 42 M14 30 C 22 26, 34 26, 50 30" stroke={INK} strokeWidth="1" fill="none" opacity=".55" strokeLinecap="round"/>
    <path d="M20 30 C 26 26, 38 26, 46 32 M18 36 C 28 32, 38 32, 50 36 M22 42 C 30 40, 38 40, 46 42" stroke={INK} strokeWidth="1" fill="none" opacity=".4" strokeLinecap="round"/>
  </svg>
)

export const RollingPin = ({ size = 48, color = '#D9A57B', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect x="14" y="24" width="36" height="16" rx="3" fill={color} opacity=".95"/>
    <rect x="14" y="24" width="36" height="16" rx="3" stroke={INK} strokeWidth="1.4" fill="none"/>
    <rect x="50" y="28" width="4" height="8" fill="#A0826D" stroke={INK} strokeWidth="1.2"/>
    <rect x="10" y="28" width="4" height="8" fill="#A0826D" stroke={INK} strokeWidth="1.2"/>
    <line x1="54" y1="32" x2="60" y2="32" stroke={INK} strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="32" x2="10" y2="32" stroke={INK} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 28 C 26 27, 38 27, 46 28 M18 36 C 26 35, 38 35, 46 36" stroke={INK} strokeWidth=".8" fill="none" opacity=".4"/>
  </svg>
)

export const Parsley = ({ size = 48, color = '#5E7F2A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 56 C 32 48, 32 38, 32 28" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
    <circle cx="24" cy="22" r="6" fill={color} opacity=".9"/>
    <circle cx="32" cy="16" r="7" fill={color} opacity=".9"/>
    <circle cx="40" cy="22" r="6" fill={color} opacity=".9"/>
    <circle cx="28" cy="28" r="5" fill={color} opacity=".9"/>
    <circle cx="36" cy="28" r="5" fill={color} opacity=".9"/>
    <circle cx="24" cy="22" r="6" stroke={INK} strokeWidth="1.2" fill="none"/>
    <circle cx="32" cy="16" r="7" stroke={INK} strokeWidth="1.2" fill="none"/>
    <circle cx="40" cy="22" r="6" stroke={INK} strokeWidth="1.2" fill="none"/>
    <circle cx="28" cy="28" r="5" stroke={INK} strokeWidth="1.2" fill="none"/>
    <circle cx="36" cy="28" r="5" stroke={INK} strokeWidth="1.2" fill="none"/>
    <path d="M22 20 q 2 -1 4 0 M30 14 q 2 -1 4 0 M38 20 q 2 -1 4 0 M26 26 q 2 -1 4 0 M34 26 q 2 -1 4 0" stroke={INK} strokeWidth=".8" fill="none" opacity=".55" strokeLinecap="round"/>
    <path d="M32 32 C 28 32, 26 30, 26 28 M32 32 C 36 32, 38 30, 38 28" stroke={INK} strokeWidth="1.1" fill="none" opacity=".7" strokeLinecap="round"/>
  </svg>
)

export const LemonHalf = ({ size = 48, color = '#FFD21A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M8 32 C 8 18, 22 8, 32 8 C 42 8, 56 18, 56 32 L 8 32 Z" fill={color} opacity=".95"/>
    <path d="M8 32 C 8 18, 22 8, 32 8 C 42 8, 56 18, 56 32 L 8 32 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M14 30 C 14 20, 24 12, 32 12 C 40 12, 50 20, 50 30 Z" fill="#FFFAEE" opacity=".9"/>
    <path d="M14 30 C 14 20, 24 12, 32 12 C 40 12, 50 20, 50 30" stroke={INK} strokeWidth="1.2" fill="none"/>
    <path d="M32 12 L 32 30 M22 14 L 28 30 M42 14 L 36 30 M16 22 L 22 30 M48 22 L 42 30" stroke={INK} strokeWidth=".9" fill="none" opacity=".55" strokeLinecap="round"/>
    <circle cx="32" cy="22" r="1.6" fill="#FFFAEE" stroke={INK} strokeWidth="1"/>
    <path d="M32 36 C 30 40, 30 44, 32 46 C 34 44, 34 40, 32 36 Z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" opacity=".9"/>
  </svg>
)

export const Butter = ({ size = 48, color = '#FFE08A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="32" cy="48" rx="22" ry="4" fill="#FFFAEE" stroke={INK} strokeWidth="1.4"/>
    <path d="M14 36 L 14 44 L 50 44 L 50 36 L 42 32 L 14 36 Z" fill={color} opacity=".95"/>
    <path d="M14 36 L 50 36 M50 36 L 42 32 L 14 36" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M14 36 L 14 44 L 50 44 L 50 36" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M18 38 L 46 38" stroke={INK} strokeWidth=".9" opacity=".4"/>
    <path d="M22 36 C 28 34, 36 34, 42 35" stroke={INK} strokeWidth=".9" fill="none" opacity=".4"/>
  </svg>
)

export const PepperGrinder = ({ size = 48, color = '#3F1F2E', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="10" r="4" fill="#A0826D" stroke={INK} strokeWidth="1.4"/>
    <path d="M24 16 L 24 50 C 24 54, 26 56, 28 56 L 36 56 C 38 56, 40 54, 40 50 L 40 16 Z" fill={color} opacity=".95"/>
    <path d="M24 16 L 24 50 C 24 54, 26 56, 28 56 L 36 56 C 38 56, 40 54, 40 50 L 40 16 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <rect x="22" y="14" width="20" height="4" rx="1" fill="#A0826D" stroke={INK} strokeWidth="1.4"/>
    <path d="M24 26 L 40 26 M24 36 L 40 36 M24 46 L 40 46" stroke="#FFFAEE" strokeWidth="1" opacity=".25"/>
    <path d="M27 22 C 26 30, 26 42, 27 50" stroke="#FFF" strokeOpacity=".4" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
  </svg>
)

export const Egg = ({ size = 48, color = '#FFFAEE', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 12 C 22 14, 16 28, 18 42 C 20 52, 26 56, 32 56 C 38 56, 44 52, 46 42 C 48 28, 42 14, 32 12 Z" fill={color} opacity=".95"/>
    <path d="M32 12 C 22 14, 16 28, 18 42 C 20 52, 26 56, 32 56 C 38 56, 44 52, 46 42 C 48 28, 42 14, 32 12 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M24 22 C 22 28, 22 36, 24 42" stroke={INK} strokeOpacity=".15" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M26 24 C 25 30, 25 36, 26 40" stroke="#FFF" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".7"/>
    <circle cx="36" cy="30" r=".8" fill={INK} opacity=".4"/>
    <circle cx="40" cy="40" r=".8" fill={INK} opacity=".4"/>
    <circle cx="30" cy="44" r=".8" fill={INK} opacity=".4"/>
  </svg>
)

export const Heart = ({ size = 48, color = '#FF2D1A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 54 C 18 44, 8 34, 10 22 C 12 14, 22 12, 32 22 C 42 12, 52 14, 54 22 C 56 34, 46 44, 32 54 Z" fill={color} opacity=".95"/>
    <path d="M32 54 C 18 44, 8 34, 10 22 C 12 14, 22 12, 32 22 C 42 12, 52 14, 54 22 C 56 34, 46 44, 32 54 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M33 53 C 19 43, 9 34, 11 22" stroke={INK} strokeWidth=".7" fill="none" opacity=".4" strokeLinecap="round"/>
    <path d="M16 22 C 14 26, 14 30, 16 32" stroke="#FFF" strokeOpacity=".5" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
)

export const Star = ({ size = 48, color = '#FFD21A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 6 L 38 24 L 58 26 L 42 38 L 48 56 L 32 46 L 16 56 L 22 38 L 6 26 L 26 24 Z" fill={color} opacity=".95"/>
    <path d="M32 6 L 38 24 L 58 26 L 42 38 L 48 56 L 32 46 L 16 56 L 22 38 L 6 26 L 26 24 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <path d="M33 7 L 39 23 L 57 27 L 43 37" stroke={INK} strokeWidth=".7" fill="none" opacity=".4" strokeLinecap="round"/>
  </svg>
)

export const Bread = ({ size = 48, color = '#B8804A', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M10 36 C 10 26, 18 18, 32 18 C 46 18, 54 26, 54 36 L 54 48 C 54 50, 52 52, 50 52 L 14 52 C 12 52, 10 50, 10 48 Z" fill={color} opacity=".95"/>
    <path d="M10 36 C 10 26, 18 18, 32 18 C 46 18, 54 26, 54 36 L 54 48 C 54 50, 52 52, 50 52 L 14 52 C 12 52, 10 50, 10 48 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M18 28 L 24 22 M28 26 L 34 20 M38 26 L 44 22 M48 30 L 52 26" stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <path d="M14 44 C 24 42, 40 42, 50 44" stroke={INK} strokeWidth="1" fill="none" opacity=".5" strokeLinecap="round"/>
    <circle cx="22" cy="36" r=".9" fill={INK} opacity=".35"/>
    <circle cx="32" cy="32" r=".9" fill={INK} opacity=".35"/>
    <circle cx="42" cy="38" r=".9" fill={INK} opacity=".35"/>
  </svg>
)

export const Anchovy = ({ size = 48, color = '#A0826D', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M6 36 C 14 28, 26 26, 40 30 L 50 24 L 54 36 L 50 48 L 40 42 C 26 46, 14 44, 6 36 Z" fill={color} opacity=".95"/>
    <path d="M6 36 C 14 28, 26 26, 40 30 L 50 24 L 54 36 L 50 48 L 40 42 C 26 46, 14 44, 6 36 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <circle cx="14" cy="34" r="1.4" fill={INK}/>
    <path d="M20 32 C 19 36, 19 38, 20 40" stroke={INK} strokeWidth="1" fill="none" opacity=".7"/>
    <path d="M14 40 C 24 44, 36 42, 46 38" stroke={INK} strokeWidth=".9" fill="none" opacity=".4" strokeLinecap="round"/>
    <path d="M30 30 L 32 24 L 36 30 Z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
)

export const Spoon = ({ size = 48, color = '#C8C8C8', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <ellipse cx="22" cy="22" rx="10" ry="12" fill={color} opacity=".9" stroke={INK} strokeWidth="1.4"/>
    <ellipse cx="22" cy="22" rx="6" ry="7" fill="none" stroke={INK} strokeWidth=".9" opacity=".5"/>
    <path d="M28 30 L 52 54" stroke={INK} strokeWidth="3" strokeLinecap="round"/>
    <path d="M28 30 L 52 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
  </svg>
)

export const Pasta = ({ size = 48, color = '#F5C518', className }: DoodleProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M15 23 C 23 19, 32 19, 49 23 C 47 28, 49 34, 47 39 C 32 45, 23 45, 15 39 C 17 34, 15 28, 15 23 Z" fill={color} opacity=".95"/>
    <path d="M14 22 C 22 18, 32 18, 50 22 C 48 28, 50 34, 48 40 C 32 46, 22 46, 14 40 C 16 34, 14 28, 14 22 Z" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    <path d="M16 26 q 10 -1, 18 -1 q 8 0, 16 1 M16 32 q 10 -1, 18 -1 q 8 0, 16 1 q 18 -1, 18 -1" stroke={INK} strokeWidth=".9" opacity=".5" fill="none"/>
  </svg>
)
