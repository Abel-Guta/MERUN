import type { CSSProperties } from 'react'
import {
  HERO_HEIGHT,
  HERO_WIDTH,
  RIDGE_FAR,
  RIDGE_MID,
  RIDGE_NEAR,
  ROUTE,
  ROUTE_MARKS,
} from '../lib/hero-art'
import './HeroArt.css'

const SUN = { x: 1010, y: 215 }
const LAST = ROUTE_MARKS.length - 1

// Decorative: the page says everything in text, so assistive technology skips this.
export function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox={`0 0 ${HERO_WIDTH} ${HERO_HEIGHT}`}
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="hero-art__sun" cx={SUN.x} cy={SUN.y} r={120} />
      <circle className="hero-art__ring" cx={SUN.x} cy={SUN.y} r={165} />
      <circle className="hero-art__dial" cx={SUN.x} cy={SUN.y} r={205} />
      <path className="hero-art__far" d={RIDGE_FAR} />
      <path className="hero-art__mid" d={RIDGE_MID} />
      <path className="hero-art__route" d={ROUTE} pathLength={1} />
      {ROUTE_MARKS.map((mark, index) =>
        index === LAST ? (
          <g key={index} className="hero-art__mark" style={{ '--i': index } as CSSProperties}>
            <line x1={mark.x} y1={mark.y} x2={mark.x} y2={mark.y - 70} />
            <path d={`M${mark.x} ${mark.y - 70} l34 12 l-34 12 Z`} />
          </g>
        ) : (
          <line
            key={index}
            className="hero-art__mark"
            style={{ '--i': index } as CSSProperties}
            x1={mark.x}
            y1={mark.y}
            x2={mark.x}
            y2={mark.y + 24}
          />
        ),
      )}
      <path className="hero-art__near" d={RIDGE_NEAR} />
    </svg>
  )
}
