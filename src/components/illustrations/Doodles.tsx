/**
 * Playful hand-drawn-style SVG illustrations.
 * All use currentColor so they inherit the parent's text colour,
 * with optional accent pops via the app's CSS variables.
 */

interface DoodleProps {
  className?: string
}

/** Open cookbook with steam — for empty recipe list */
export function CookbookDoodle({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Book body */}
      <path
        d="M20 75 Q20 30 60 28 Q100 30 100 75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Spine */}
      <line
        x1="60" y1="28" x2="60" y2="78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left page lines */}
      <line x1="30" y1="45" x2="52" y2="43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="32" y1="53" x2="50" y2="51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="34" y1="61" x2="48" y2="59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Right page lines */}
      <line x1="68" y1="43" x2="90" y2="45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="70" y1="51" x2="88" y2="53" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Heart on right page */}
      <path
        d="M76 60 Q76 56 79 56 Q82 56 82 60 Q82 56 85 56 Q88 56 88 60 Q88 66 82 70 Q76 66 76 60Z"
        fill="var(--color-accent)"
        opacity="0.6"
      />
      {/* Steam wisps */}
      <path d="M45 22 Q43 16 46 10" stroke="var(--color-sunny)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M55 20 Q57 12 54 6" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M65 22 Q63 14 66 8" stroke="var(--color-pop)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Bottom edge */}
      <path
        d="M20 75 Q60 80 100 75"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/** Steaming pot — for empty cook log */
export function PotDoodle({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 80 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pot body */}
      <path
        d="M16 32 L16 54 Q16 62 24 62 L56 62 Q64 62 64 54 L64 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lid */}
      <path
        d="M12 32 L68 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Lid handle */}
      <circle cx="40" cy="28" r="3" stroke="currentColor" strokeWidth="2" fill="var(--color-sunny)" opacity="0.6" />
      {/* Handles */}
      <path d="M16 42 Q10 42 10 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M64 42 Q70 42 70 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Steam */}
      <path d="M30 24 Q28 18 31 12" stroke="var(--color-sunny)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M40 22 Q42 14 39 8" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M50 24 Q48 16 51 10" stroke="var(--color-pop)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  )
}

/** Chat bubbles — for empty comments */
export function ChatDoodle({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Big bubble */}
      <rect
        x="4" y="4" width="44" height="30" rx="12"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="var(--color-accent-soft)"
        opacity="0.5"
      />
      <path
        d="M16 34 L12 44 L24 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="var(--color-accent-soft)"
        opacity="0.5"
      />
      {/* Dots in big bubble */}
      <circle cx="18" cy="19" r="2" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="26" cy="19" r="2" fill="var(--color-pop)" opacity="0.6" />
      <circle cx="34" cy="19" r="2" fill="var(--color-sunny)" opacity="0.6" />
      {/* Small bubble */}
      <rect
        x="38" y="18" width="36" height="24" rx="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--color-pop-soft)"
        opacity="0.5"
      />
      <path
        d="M62 42 L66 50 L56 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="var(--color-pop-soft)"
        opacity="0.5"
      />
      {/* Heart in small bubble */}
      <path
        d="M52 27 Q52 24 54.5 24 Q57 24 57 27 Q57 24 59.5 24 Q62 24 62 27 Q62 31 57 34 Q52 31 52 27Z"
        fill="var(--color-accent)"
        opacity="0.5"
      />
    </svg>
  )
}

/** Whimsical plate with food — for recipe cards without photos */
export function PlateDoodle({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Plate */}
      <ellipse
        cx="40" cy="48" rx="30" ry="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <ellipse
        cx="40" cy="44" rx="24" ry="8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.2"
      />
      {/* Food pile - abstract colourful shapes */}
      <circle cx="34" cy="36" r="6" fill="var(--color-accent)" opacity="0.4" />
      <circle cx="46" cy="34" r="7" fill="var(--color-sunny)" opacity="0.35" />
      <circle cx="40" cy="30" r="5" fill="var(--color-sunny)" opacity="0.45" />
      <circle cx="38" cy="38" r="4" fill="var(--color-pop)" opacity="0.3" />
      {/* Sparkles */}
      <path d="M58 22 L60 18 L62 22 L58 22" fill="var(--color-sunny)" opacity="0.6" />
      <path d="M22 20 L23 17 L24 20 L22 20" fill="var(--color-accent)" opacity="0.5" />
      <circle cx="52" cy="16" r="1.5" fill="var(--color-pop)" opacity="0.5" />
    </svg>
  )
}

/** Small fork & knife — for cook log stamp */
export function UtensilsMini({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fork */}
      <path
        d="M4 2 L4 6 M4 6 L4 14 M2 2 L2 5 Q2 6 4 6 Q6 6 6 5 L6 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Knife */}
      <path
        d="M11 2 Q13 2 13 5 L13 6 L11 6 L11 14"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Sparkle cluster — decorative accent */
export function Sparkles({ className }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2 L13 8 L18 6 L14 10 L20 12 L14 14 L18 18 L13 16 L12 22 L11 16 L6 18 L10 14 L4 12 L10 10 L6 6 L11 8 Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
}
