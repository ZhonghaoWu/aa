import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../../context/Modal";
import { useEffect, useState } from "react";
import { createReviewThunk } from "../../../store/review";
import { getSpotThunk } from "../../../store/spots";
import "./CreateModal.css";

const CreateModal = ({ spotId }) => {
  const user = useSelector((state) => state.session.user);
  const oneSpot = useSelector((state) => state.spots.singleSpot);

  const dispatch = useDispatch();

  const { closeModal } = useModal();

  const [review, setReview] = useState("");
  const [stars, setStars] = useState();
  const [validationErrors, setValidationErrors] = useState({});
  const [activeRating, setActiveRating] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const errors = {};
    if (review.length < 10)
      errors.review = "Please enter more than 10 characters";
    setValidationErrors(errors);
  }, [review]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (
      !Object.values(validationErrors).length &&
      user.id !== oneSpot.ownerId
    ) {
      const payload = {
        review,
        stars,
      };

      await dispatch(createReviewThunk(payload, spotId));

      await dispatch(getSpotThunk(spotId));

      // history.push(`/spots/${spotId}`)
      closeModal();
    }
  };

  const reviewButtonId =
    review.length < 10 && !stars
      ? "submit-review-not-valid"
      : "submit-review-button";

  return (
    <>
      <div>
        <h3>How was your stay?</h3>
        <form onSubmit={onSubmit}>
          <label>
            <textarea
              rows="5"
              cols="40"
              type="text"
              placeholder="Leave your review here..."
              onChange={(e) => setReview(e.target.value)}
            />
          </label>
          {validationErrors.review && submitted && (
            <p>{validationErrors.review}</p>
          )}
          <div>
            <div
              className={
                activeRating >= 1
                  ? "fa-sharp fa-solid fa-star"
                  : "fa-sharp fa-regular fa-star"
              }
              onMouseEnter={() => setActiveRating(1)}
              onClick={() => {
                setStars(1);
              }}
            ></div>
            <div
              className={
                activeRating >= 2
                  ? "fa-sharp fa-solid fa-star"
                  : "fa-sharp fa-regular fa-star"
              }
              onMouseEnter={() => setActiveRating(2)}
              onClick={() => {
                setStars(2);
                setActiveRating(2);
              }}
            ></div>
            <div
              className={
                activeRating >= 3
                  ? "fa-sharp fa-solid fa-star"
                  : "fa-sharp fa-regular fa-star"
              }
              onMouseEnter={() => setActiveRating(3)}
              onClick={() => {
                setStars(3);
                setActiveRating(3);
              }}
            ></div>
            <div
              className={
                activeRating >= 4
                  ? "fa-sharp fa-solid fa-star"
                  : "fa-sharp fa-regular fa-star"
              }
              onMouseEnter={() => setActiveRating(4)}
              onClick={() => {
                setStars(4);
                setActiveRating(4);
              }}
            ></div>
            <div
              className={
                activeRating >= 5
                  ? "fa-sharp fa-solid fa-star"
                  : "fa-sharp fa-regular fa-star"
              }
              onMouseEnter={() => setActiveRating(5)}
              onClick={() => {
                setStars(5);
                setActiveRating(5);
              }}
            ></div>
            Stars
          </div>
          <button
            type="submit"
            id={reviewButtonId}
            disabled={review.length < 10 || !stars}
          >
            Submit Your Review
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateModal;
