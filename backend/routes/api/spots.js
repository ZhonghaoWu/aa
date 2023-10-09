const express = require("express");
const Sequelize = require("sequelize");
const {
  Spot,
  User,
  Review,
  SpotImage,
  ReviewImage,
  Booking,
} = require("../../db/models");
const { requireAuthorization } = require("../../utils/auth");
const { requireAuth } = require("../../utils/auth");
// const { addImagePreviews } = require('../../utils/helpers')
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const Op = Sequelize.Op;

const router = express.Router();

//create spot validator
const validateCreateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude is not valid"),
  check("name")
    .exists({ checkFalsy: true })
    .withMessage("Name must be less than 50 characters"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

//edit spot validator
const validateQuery = [
  check("page")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 10, allowNull: true })
    .withMessage("Page must be between 1 and 10"),
  check("size")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 20, allowNull: true })
    .withMessage("Size must be between 1 and 20"),
  check("minLat")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid"),
  check("maxLat")
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Maximum latitude is invalid"),
  check("minLng")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid"),
  check("maxLng")
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid"),
  check("minPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  check("maxPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors,
];

// review spot validator
const validateNewReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .notEmpty()
    .withMessage("Stars must be provided")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

//create a spot
router.post("/", requireAuth, validateCreateSpot, async (req, res) => {
  try {
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const newSpot = await Spot.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    res.status(201).json(newSpot);
  } catch (error) {
    console.error("Error creating new spot:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//get all spots with query filters
router.get("/", validateQuery, async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  if (!page || page > 10 || isNaN(page)) page = 1;
  if (!size || size > 20 || isNaN(size)) size = 20;

  let pagination = {
    limit: size,
    offset: size * (page - 1),
  };

  let where = {};

  if (minLat) {
    where.lat = { [Op.gte]: minLat };
  }
  if (maxLat) {
    where.lat = { [Op.lte]: maxLat };
  }
  if (minLng) {
    where.lng = { [Op.gte]: minLng };
  }
  if (maxLng) {
    where.lng = { [Op.lte]: maxLng };
  }
  if (minPrice) {
    where.price = { [Op.gte]: minPrice };
  }
  if (maxPrice) {
    where.price = { [Op.lte]: minPrice };
  }

  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
      },
      {
        model: SpotImage,
      },
    ],
    where,
    ...pagination,
  });
  const spotsArray = spots.map((spot) => {
    const newSpot = spot.toJSON();

    if (newSpot.Reviews) {
      let sum = 0;
      let count = 0;
      newSpot.Reviews.forEach((review) => {
        if (review) {
          sum += review.stars;
          count++;
        }
      });

      if (count > 0) {
        newSpot.avgRating = sum / count;
      } else {
        newSpot.avgRating = 0;
      }

      delete newSpot.Reviews;
    } else {
      newSpot.avgRating = 0;
    }

    newSpot.SpotImages.forEach((image) => {
      if (image.preview === true) {
        newSpot.previewImage = image.url;
      }
    });

    if (!newSpot.previewImage) {
      newSpot.previewImage = "no preview image";
    }

    delete newSpot.SpotImages;

    return newSpot;
  });

  let displayResult = { Spots: spotsArray };

  if (page === 0) displayResult.page = 1;
  else displayResult.page = parseInt(page);

  displayResult.size = parseInt(size);

  return res.status(200).json(displayResult);
});

//Get all Spots owned by the Current User
router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const spots = await Spot.findAll({
    where: { ownerId: userId },
    include: [{ model: Review }, { model: SpotImage }],
  });

  const spotsArray = spots.map((spot) => {
    const newSpot = spot.toJSON();

    newSpot.SpotImages.forEach((image) => {
      if (image.preview === true) {
        newSpot.previewImage = image.url;
      }
    });

    if (!newSpot.previewImage) {
      newSpot.previewImage = "no preview image";
    }

    delete newSpot.SpotImages;

    if (newSpot.Reviews) {
      let sum = 0;
      let count = 0;
      newSpot.Reviews.forEach((review) => {
        if (review) {
          sum += review.stars;
          count++;
        }
      });

      if (count > 0) {
        newSpot.avgRating = sum / count;
      } else {
        newSpot.avgRating = 0;
      }

      delete newSpot.Reviews;
    } else {
      newSpot.avgRating = 0;
    }

    return newSpot;
  });

  return res.status(200).json({ Spots: spotsArray });
});

//delete a spot
router.delete("/:spotId", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;

  const spot = await Spot.findOne({
    where: {
      id: spotId,
      ownerId: userId,
    },
  });

  if (spot) {
    await spot.destroy();

    return res.status(200).json({ message: "Successfully deleted" });
  } else {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
});

//get details of a spot from an id
router.get("/:spotId", async (req, res) => {
  const spotId = req.params.spotId;

  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: SpotImage,
        as: "SpotImages",
        attributes: ["id", "url", "preview"],
      },
      {
        model: Review,
        attributes: ["stars"],
      },
    ],
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const numReviews = spot.Reviews.length;
  const totalStars = spot.Reviews.reduce(
    (total, review) => total + review.stars,
    0
  );
  let avgStarRating = 0;

  if (numReviews > 0) {
    avgStarRating = totalStars / numReviews;
  }

  return res.status(200).json({
    id: spot.id,
    ownerId: spot.ownerId,
    address: spot.address,
    city: spot.city,
    state: spot.state,
    country: spot.country,
    lat: spot.lat,
    lng: spot.lng,
    name: spot.name,
    description: spot.description,
    price: spot.price,
    createdAt: spot.createdAt,
    updatedAt: spot.updatedAt,
    numReviews: numReviews,
    avgRating: avgStarRating,
    SpotImages: spot.SpotImages,
    Owner: spot.User,
  });
});

// Edit a spot
router.put("/:spotId", requireAuth, validateCreateSpot, async (req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;

  const spot = await Spot.findOne({
    where: {
      id: spotId,
      ownerId: userId,
    },
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  await spot.update({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.status(200).json(spot);
});

//add an image to a spot based on the spot's id
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { user } = req;

  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);

  if (spot) {
    if (user.id === spot.ownerId) {
      const { url, preview } = req.body;

      const newSpotImage = await SpotImage.create({
        spotId,
        url,
        preview,
      });

      return res.status(201).json({
        id: newSpotImage.id,
        preview: newSpotImage.preview,
        url: newSpotImage.url,
      });
    } else {
      return res.status(403).json({
        message: "You don't have permission to add an image to this spot",
      });
    }
  } else {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
});

// Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
  const spotId = req.params.spotId;

  const spot = await Spot.findByPk(spotId);

  if (spot) {
    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    return res.status(200).json({ Reviews: reviews });
  } else {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
});

// Create a Review for a Spot based on the Spot's id
router.post(
  "/:spotId/reviews",
  requireAuth,
  validateNewReview,
  async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);
    const { review, stars } = req.body;

    if (!spot) {
      res.status(404);
      return res.json({ message: "Spot couldn't be found" });
    }

    const reviewCheck = await Review.findOne({
      where: {
        userId: req.user.id,
        spotId: spot.id,
      },
    });

    if (reviewCheck) {
      res.status(500);
      return res.json({ message: "User already has a review for this spot" });
    }

    const newReview = await Review.create({
      userId: req.user.id,
      spotId: spot.id,
      review,
      stars,
    });

    res.status(201);
    res.json(newReview);
  }
);

// Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);
  if (spot) {
    let bookings;
    if (spot.ownerId === userId) {
      bookings = await Booking.findAll({
        where: { spotId },
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });
    } else {
      bookings = await Booking.findAll({ where: { spotId } });
    }

    return res.status(200).json({ Bookings: bookings });
  } else {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
});

// Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);
  const user = await User.findByPk(req.user.id);
  const { startDate, endDate } = req.body;

  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);

  if (newEndDate <= newStartDate) {
    res.status(400);
    return res.json({
      message: "Bad Request",
      errors: { endDate: "endDate cannot be on or before startDate" },
    });
  }

  if (!spot) {
    res.status(404);
    return res.json({ message: "Spot couldn't be found" });
  }

  if (user.id === spot.ownerId) {
    res.status(403);
    return res.json({ message: "Spot must NOT belong to the current user" });
  }

  const existingBooking = await Booking.findOne({
    where: {
      spotId: spot.id,
      [Op.or]: [
        { startDate: { [Op.between]: [newStartDate, newEndDate] } },
        { endDate: { [Op.between]: [newStartDate, newEndDate] } },
      ],
    },
  });

  if (existingBooking) {
    res.status(403);
    return res.json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  const newBooking = await Booking.create({
    spotId: spot.id,
    userId: user.id,
    startDate,
    endDate,
  });

  res.json(newBooking);
});

module.exports = router;
