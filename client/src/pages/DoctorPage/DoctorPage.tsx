import mockData from '../../api/mockdata.json';
import { DoctorHeader } from './components/DoctorHeader';
import { PatientReviews } from './components/PatientReviews';
import type { Doctor, Review } from '../../types/doctor';

export const DoctorProfilePage = () => {
  const doctor: Doctor = mockData.doctor;
  const reviews: Review[] = mockData.reviews;

  return (
    <main>
      <DoctorHeader doctor={doctor} />

      <div>
        <div>
          <section>
            <h2>About the Doctor</h2>
            <p>{doctor.about}</p>
          </section>

          <section>
            <h2>Areas of expertise</h2>
            <ul>
              {doctor.expertise.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div>
          <section>
            <h2>Avaliability</h2>
            <p>Open slots today</p>
            
            <div>
              {doctor.availabilitySlots.map((slot, index) => (
                <button key={index}>{slot}</button>
              ))}
            </div>
            
            <button>Load more slots</button>
          </section>
        </div>
      </div>

      <PatientReviews reviews={reviews} />
    </main>
  );
};