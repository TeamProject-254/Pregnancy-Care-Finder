import type { Doctor } from '../../../../types/doctor';

interface DoctorHeaderProps {
  doctor: Doctor;
}

export const DoctorHeader = ({ doctor }: DoctorHeaderProps) => {
  return (
    <section>
      <div>
        <img src={doctor.photoUrl} alt={`${doctor.name} profile`} />
      </div>
      <div>
        <header>
          <h1>{doctor.name}</h1>
          {doctor.isVerified && <span>Verified specialist</span>}
        </header>
        <p>{doctor.specialty}</p>
        <ul>
          <li>{doctor.experience}</li>
          <li>{doctor.location}</li>
          <li>{doctor.rating} ({doctor.reviewsCount})</li>
          <li>{doctor.languages.join(', ')}</li>
        </ul>
        <div>
          <span>{doctor.price}$/visit</span>
          <button>Book appointment</button>
        </div>
      </div>
    </section>
  );
};