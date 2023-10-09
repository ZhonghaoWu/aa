const express = require("express");
const { requireAuth } = require("../../utils/auth");
const {
  Review,
  User,
  Spot,
  ReviewImage,
  SpotImage,
  Booking,
} = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const router = express.Router();

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

// Get all reviews of current user
router.get("/current", requireAuth, async (req, res) => {
  let user = await User.findByPk(req.user.id);
  let reviews = await Review.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        include: [{ model: SpotImage }],
        attributes: [
          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "price",
        ],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });

  let reviewsList = [];
  reviews.forEach((review) => {
    reviewsList.push(review.toJSON());
  });

  reviewsList.forEach((review) => {
    review.Spot.SpotImages.forEach((image) => {
      if (image.preview === true) {
        review.Spot.previewImage = image.url;
      }
    });
    delete review.Spot.SpotImages;
  });

  res.json({ Reviews: reviewsList });
});

//edit a review
router.put("/:reviewsId", validateReview, requireAuth, async (req, res) => {
  const editReview = await Review.findByPk(req.params.reviewsId);
  const user = await User.findByPk(req.user.id);

  if (editReview) {
    if (editReview.userId === user.id) {
      const { review, stars } = req.body;

      await editReview.update({
        review,
        stars,
      });
    } else {
      res.status(403).json({ message: "Reviews must belong to current user" });
    }
  } else {
    res.status(404).json({ message: "Review couldn't be found" });
  }
  res.json(editReview);
});

// Delete a Review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId);
  const user = await User.findByPk(req.user.id);

  if (!review) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
    });
  }

  if (review.userId !== user.id) {
    res.status(403);
    return res.json({
      message: "Review must belong to the current user",
    });
  }

  await review.destroy();

  res.json({ message: "Successfully deleted" });
});

// Add an Image to a Review based on the Review's id
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { user } = req;
  const { url } = req.body;

  let review = await Review.findByPk(req.params.reviewId, {
    include: ReviewImage,
  });

  if (!review) {
    res.status(404);
    return res.json({ message: "Review couldn't be found" });
  }

  if (user.id === review.userId && review.ReviewImages.length < 10) {
    const image = await review.createReviewImage({
      url: url,
      reviewId: req.params.reviewId,
    });

    if (user.id !== review.userId) {
      res.status(403);
      return res.json({
        message: "Only author of this review can add a new image",
      });
    }

    await image.save();

    let response = {};
    response.id = image.id;
    response.url = image.url;

    res.status(200);
    res.json(response);
  } else if (review.ReviewImages.length >= 10) {
    res.status(403);
    return res.json({
      message: "Maximum number of images for this resource was reached",
    });
  }
});

module.exports = router;
