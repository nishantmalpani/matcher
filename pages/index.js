import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Matching System</title>
        <meta name="description" content="Matching system for roommates and jobs" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Matching System</h1>
        
        <div className={styles.matchingOptions}>
          <Link href="/roommate-matcher" className={styles.matchingCard}>
            <h2>Roommate Matcher</h2>
            <p>Match people with potential roommates based on mutual preferences</p>
            <span className={styles.type}>Symmetric Matching</span>
          </Link>

          <Link href="/job-matcher" className={styles.matchingCard}>
            <h2>Job Matcher</h2>
            <p>Match job seekers with companies using stable matching algorithm</p>
            <span className={styles.type}>Asymmetric Matching</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
