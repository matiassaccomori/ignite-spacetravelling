import Link from 'next/link'
import styles from './header.module.scss'

export function Header() {
  return (
    <header className={styles.container}>
      <Link href="/">
        <img src="/images/logo.svg" alt="logo" />
      </Link>
    </header>
  )
}