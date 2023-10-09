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

const router = express.Router();

//delete a Spot Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
  const image = await SpotImage.findByPk(req.params.imageId);

  if (!image) {
    return res.status(404).json({
      message: "Spot Image couldn't be found",
    });
  }

  const spot = await Spot.findOne({
    where: {
      id: image.spotId,
    },
  });

  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      message: "You do not have access to delete the Spot Image",
    });
  }

  await image.destroy();
  res.json({
    message: "Successfully deleted",
  });
});

module.exports = router;
