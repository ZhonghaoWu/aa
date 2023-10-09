import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useModal } from "../../../context/Modal";
import { deleteReviewThunk } from "../../../store/review";

// import "./CreateReviewModal.css";

const DeleteReviewModal = ({ spotId, reviewId }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { closeModal } = useModal();

  const deleteYes = () => {
    dispatch(deleteReviewThunk(reviewId, spotId));
    history.push(`/spots/${spotId}`);
    closeModal();
  };

  const deleteNo = () => {
    closeModal();
  };

  return (
    <>
      <div>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this review?</p>
        <div>
          <button onClick={deleteYes}>Yes (Delete Review)</button>
          <button onClick={deleteNo}>No (Keep Review)</button>
        </div>
      </div>
    </>
  );
};

export default DeleteReviewModal;
