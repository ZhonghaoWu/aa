import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSpotThunk, getAllSpotsThunk } from "../../store/spots";
import AllReviews from "./spotReview";

const SpotId = () => {
  const dispatch = useDispatch();
  const { spotId } = useParams();
  const Spot = useSelector((state) => state.spots.singleSpot);
  const reviewObj = useSelector((state) => state.reviews.spot);
  const newReview = Object.values(reviewObj);

  const [loadData, setLoadData] = useState(false);

  useEffect(() => {
    dispatch(getSpotThunk(spotId));
    dispatch(getAllSpotsThunk()).then(() => setLoadData(true));
  }, [dispatch, spotId]);

  const handleReserve = () => {
    alert("Feature Coming Soon");
  };

  if (!newReview || !Spot) return null;

  if (!Spot.SpotImages) return null;

  //   getting review avg rating
  let avgReview = 0;
  if (newReview.length) {
    let sum = 0;
    for (let i = 0; i < newReview.length; i++) {
      sum += newReview[i].stars;
    }
    avgReview = sum / newReview.length;
  }

  return (
    <>
      <div>
        <h1>{Spot?.name}</h1>
        <p>
          {Spot?.city}, {Spot?.state}, {Spot?.country}
        </p>
        <img
          src={Spot?.SpotImages?.find((img) => img.preview === true)?.url}
          alt="img"
        />
        <div>
          <h2>
            Hosted by {Spot?.Owner?.firstName} {Spot?.Owner?.lastName}
          </h2>
          <p>{Spot?.description}</p>
        </div>
        <div>
          <div>
            <div>
              <b>${Spot?.price}</b> night
            </div>
            <div>
              <i className="fa-solid fa-star"></i>
              <div></div>

              <div>
                {Spot?.numReviews ? <span>·</span> : ""}
                {Spot?.numReviews ? (
                  <span>
                    {Spot?.numReviews}
                    {Spot?.numReviews === 1 ? " Review" : " Reviews"}
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <button onClick={handleReserve} id="reserve-button">
            Reserve
          </button>
        </div>
      </div>
      <div>
        <div></div>
      </div>
      <div>
        <div>
          <div>
            <i></i>
          </div>
          {Spot?.numReviews ? (
            <div>
              {parseFloat(avgReview)?.toFixed(1)} · {Spot.numReviews}{" "}
              {Spot.numReviews === 1 ? "Review" : "Reviews"}
            </div>
          ) : (
            <div>New</div>
          )}
        </div>
        <AllReviews spotId={spotId} />
      </div>
    </>
  );
};

export default SpotId;
