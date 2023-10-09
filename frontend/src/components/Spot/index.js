import { useDispatch, useSelector } from "react-redux";
import { getAllSpotsThunk } from "../../store/spots";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import "./Spot.css";

const Spots = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots);
  // console.log("🚀~ file: index.js:10 ~ Spots ~ spots:", spots);
  const allSpots = Object.values(spots.allSpots);

  useEffect(() => {
    dispatch(getAllSpotsThunk());
  }, [dispatch]);

  return (
    <>
      <div className="spots-container">
        <div>
          {allSpots.map((spot) => (
            <NavLink to={`/spots/${spot.id}`} key={spot.id}>
              <div>
                <div>
                  <img id="spot-img" src={`${spot.previewImage}`} alt="img" />
                  <span>{spot.name}</span>
                </div>
                <div className="under-img">
                  <div>
                    {spot.city}, {spot.state}
                  </div>

                  <div>
                    <i className="fa-solid fa-star"></i>
                    {spot.avgRating}
                  </div>
                </div>

                <div className="price">
                  <b>${spot.price}</b> night
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Spots;
