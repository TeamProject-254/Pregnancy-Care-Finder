import type { Review } from '../../../../types/doctor';
import filledStar from '../../../../assets/img/star-filled.svg';
import emptyStar from '../../../../assets/img/star-empty.svg';

interface PatientReviewsProps {
  reviews: Review[];
}

export const PatientReviews = ({ reviews }: PatientReviewsProps) => {
  const renderStars = (ratingStr: string) => {
    const roundedRating = Math.round(Number(ratingStr));
    
    return Array.from({ length: 5 }).map((_, index) => (
      <img 
        key={index} 
        src={index < roundedRating ? filledStar : emptyStar} 
        alt={index < roundedRating ? "Filled star" : "Empty star"} 
      />
    ));
  };

  return (
    <section>
      <h2>Patien Reviews ({reviews.length})</h2>
      <div>
        {reviews.map((review) => (
          <article key={review.id}>
            <header>
              <div>
                <div>{/* Тут аватарка юзера */}</div>
                <div>
                  <h3>{review.name}</h3>
                  <span>{review.date}</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {renderStars(review.rating)}
                </div>
                <span>{review.rating}</span>
              </div>
            </header>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};