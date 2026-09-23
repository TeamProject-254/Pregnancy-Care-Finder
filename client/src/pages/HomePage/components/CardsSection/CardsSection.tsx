import styles from './CardsSection.module.scss';

export const CardsSection = () => {
  const sections = [
    {
      title: 'Find a Doctor',
      description: 'dd'
    },
    {
      title: 'Choose a Time',
      description: 'dd'
    },
    {
      title: 'Book Online',
      description: 'dd'
    }
  ];

  return (
    <div className={styles['cards-section']}>
        {sections.map(el => 
          <div key={el.title} className={styles['cards-section__container']}>
            <h2 className={styles['cards-section__section-title']}>
              {el.title}
            </h2>
            <p className={styles['cards-section__section-description']}>
              {el.description}
            </p>
          </div>
        )}
    </div>
  );
};