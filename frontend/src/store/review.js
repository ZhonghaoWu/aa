import { csrfFetch } from "./csrf";
import { getSpotThunk } from "./spots";

// case type
const GET_REVIEWS = "review/getAllReviews";
const CREATE_REVIEW = "review/createReview";
const DELETE_REVIEW = "review/deleteReview";

//action

const getAllReviews = (reviews) => {
  return {
    type: GET_REVIEWS,
    reviews,
  };
};

const createReview = (review) => {
  return {
    type: CREATE_REVIEW,
    review,
  };
};

const deleteReview = (reviewId) => {
  return {
    type: DELETE_REVIEW,
    reviewId,
  };
};

//thunks
export const getAllReviewsThunk = (spotId) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}/reviews`);
  if (res.ok) {
    const reviews = await res.json();
    dispatch(getAllReviews(reviews));
    return reviews;
  }
};

export const createReviewThunk = (review, spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });

  if (response.ok) {
    const review = await response.json();
    await dispatch(createReview(review));
    await dispatch(getAllReviewsThunk(spotId));
    return review;
  }
};

export const deleteReviewThunk = (reviewId, spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    await dispatch(deleteReview(reviewId));
    await dispatch(getSpotThunk(spotId));
  }
};

// initial state
const initialState = { spot: {}, user: {} };

// reducer
const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEWS:
      const newState = { ...state, spot: {}, user: {} };
      const reviews = action.reviews.Reviews;
      reviews.forEach((review) => (newState.spot[review.id] = review));
      return newState;
    case CREATE_REVIEW: {
      const newState = {
        ...state,
        spot: { ...state.spot },
        user: { ...state.user },
      };
      newState.spot[action.review.id] = action.review;
      return newState;
    }
    case DELETE_REVIEW: {
      const newState = {
        ...state,
        spot: { ...state.spot },
        user: { ...state.user },
      };
      delete newState.spot[action.reviewId];
      return newState;
    }
    default:
      return state;
  }
};

export default reviewReducer;
