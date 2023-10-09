import { csrfFetch } from "./csrf";

// type
const GET_ALL_SPOTS = "spots/getAllSpots"; // snakeCase for "spot/getAllSpots"
const GET_SPOT = "spots/getSpot";

// action

const getAllSpots = (spots) => {
  return {
    type: GET_ALL_SPOTS,
    spots,
  };
};

const getSpot = (spot) => {
  return {
    type: GET_SPOT,
    spot,
  };
};

//thunks

//get all spots on landing page THUNK
export const getAllSpotsThunk = () => async (dispatch) => {
  const res = await csrfFetch("/api/spots");

  if (res.ok) {
    let spots = await res.json();
    spots = spots.Spots;
    dispatch(getAllSpots(spots));

    return spots;
  }
};

//get one spot THUNK
export const getSpotThunk = (spotId) => async (dispatch) => {
  const res = await csrfFetch(`/api/spots/${spotId}`);
  if (res.ok) {
    const spotDetails = await res.json();
    dispatch(getSpot(spotDetails));

    return spotDetails;
  } else {
    const errors = await res.json();
    return errors;
  }
};

//Initial State
const initialState = { allSpots: {}, singleSpot: {} };

//reducer
const spotReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case GET_ALL_SPOTS:
      let allSpots = {};
      action.spots.forEach((spot) => (allSpots[spot.id] = spot));
      return { allSpots: { ...allSpots } };

    case GET_SPOT:
      newState = {
        ...state,
        allSpots: { ...state.allSpots },
        singleSpot: { ...state.singleSpot },
      };
      return { ...state, singleSpot: { ...action.spot } };
    default:
      return state;
  }
};

export default spotReducer;
