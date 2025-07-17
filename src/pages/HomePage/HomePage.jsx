import styles from './HomePage.module.scss'

const HomePage = () => {
  return (
    <div className={styles.container}>
      <img
        src="src\assets\work-in-progress.svg"
        alt="Work in progress"
        className={styles.image}
      />
      <h1 className={styles.title}>Stiamo lavorando alla Home!</h1>
      <p className={styles.text}>
        Presto troverai qui tutti i post del nostro fantastico blog multiutente.
      </p>
    </div>
  )
}

export default HomePage