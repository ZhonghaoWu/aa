import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllReviewsThunk } from "../../store/review";
import { getSpotThunk } from "../../store/spots";
import OpenModalButton from "../OpenModalButton";
import DeleteReviewModal from "../ReviewModal/DeleteModal";
import CreateModal from "../ReviewModal/CreateModal";

const AllReviews = ({ spotId }) => {
  const review = useSelector((state) => state.reviews);
  const reviewArr = Object.values(review.spot);

  const user = useSelector((state) => state.session.user);

  const spot = useSelector((state) => state.spots.singleSpot);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllReviewsThunk(spotId));
    dispatch(getSpotThunk(spotId));
  }, [dispatch]);

  let userReview;

  if (user) {
    userReview = reviewArr.find((review) => review.User?.id === user?.id);
  }

  if (!user || !user.id) {
    return (
      <>
        <div>
          {reviewArr.toReversed().map((review) => (
            <>
              <h3>{review?.User?.firstName}</h3>
              <h5>
                {new Date(review.createdAt).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {new Date(review.createdAt).getFullYear()}
              </h5>
              <h4>{review.review}</h4>
            </>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {!userReview && user?.id !== spot.Owner?.id && (
        <div>
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={<CreateModal spotId={spotId} />}
          />
          {!reviewArr.length && !userReview && user?.id !== spot.Owner?.id && (
            <p id="be-first">Be the first to post a review!</p>
          )}
        </div>
      )}
      <div>
        {reviewArr.toReversed().map((review) => (
          <>
            <h3>{review?.User?.firstName}</h3>
            <h5>
              {new Date(review.createdAt).toLocaleString("default", {
                month: "long",
              })}{" "}
              {new Date(review.createdAt).getFullYear()}
            </h5>
            <h4>{review.review}</h4>
            {user.id === review.userId && (
              <div>
                <OpenModalButton
                  buttonText="Delete Review"
                  modalComponent={
                    <DeleteReviewModal spotId={spotId} reviewId={review.id} />
                  }
                />
              </div>
            )}
          </>
        ))}
      </div>
    </>
  );
};

export default AllReviews;
