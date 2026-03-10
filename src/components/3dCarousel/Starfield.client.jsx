"use client"

import styles from "./Starfield.module.css"

export default function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className={styles.starsSmall} />
      <div className={styles.starsMedium} />
      <div className={styles.starsLarge} />
    </div>
  )
}
