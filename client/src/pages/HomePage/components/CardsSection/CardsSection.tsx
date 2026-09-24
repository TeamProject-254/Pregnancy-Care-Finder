import styles from './CardsSection.module.scss';
import bookOnlineIcon from '../../../../assets/img/book-online-icon.svg';
import findADoctorIcon from '../../../../assets/img/find-a-doctor-icon.svg';
import chooseATimeIcon from '../../../../assets/img/choose-a-time-icon.svg';

export const CardsSection = () => {
  const sections = [
    {
      title: 'Find a Doctor',
      description: `Search by specialty, service, location,
or spoken language.`,
      url: findADoctorIcon
    },
    {
      title: 'Choose a Time',
      description: `View real-time provider availability and open time slots.`,
      url: chooseATimeIcon
    },
    {
      title: 'Book Online',
      description: `Confirm your appointment instantly in 2 clicks without phone calls.`,
      url: bookOnlineIcon
    }
  ];

  return (
    <div className={styles['cards-section']}>
      {sections.map(el =>
        <div key={el.title} className={styles['cards-section__container']}>
          <img src={el.url} alt="Card icon" />
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