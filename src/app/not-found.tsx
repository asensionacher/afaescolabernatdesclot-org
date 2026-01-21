import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Pàgina no trobada</h1>
        <p className={styles.description}>
          Ho sentim, la pàgina que busques no existeix o ha estat moguda.
        </p>
        <div className={styles.emoji}>🤔</div>
        <Link href="/" className={styles.homeButton}>
          Tornar a l'inici
        </Link>
      </div>
    </div>
  );
}
