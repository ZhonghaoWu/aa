const express = require("express");
const Sequelize = require("sequelize");
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
const Op = Sequelize.Op;

//get all current user's bookings
router.get("/current", requireAuth, async (req, res) => {
  let user = await User.findByPk(req.user.id);
  const bookings = await Booking.findAll({
    where: { userId: user.id },
    include: [
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
    ],
  });
  let bookingsList = [];
  bookings.forEach((booking) => {
    bookingsList.push(booking.toJSON());
  });
  bookingsList.forEach((booking) => {
    booking.Spot.SpotImages.forEach((image) => {
      if (image.preview === true) {
        booking.Spot.previewImage = image.url;
      }
    });
    delete booking.Spot.SpotImages;
  });

  res.json({ Bookings: bookingsList });
});

// edit a booking
router.put("/:bookingId", requireAuth, async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  const user = await User.findByPk(req.user.id);
  const { startDate, endDate } = req.body;

  const newStartDate = new Date(startDate);
  const newEndDate = new Date(endDate);
  const currentDate = new Date();

  if (newEndDate <= newStartDate) {
    res.status(400);
    return res.json({
      message: "Bad Request",
      errors: { endDate: "endDate cannot be on or before startDate" },
    });
  }

  if (!booking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
    });
  }

  if (booking.userId !== user.id) {
    res.status(403);
    return res.json({
      message: "Booking must belong to the current user",
    });
  }

  if (booking.endDate < currentDate) {
    res.status(403);
    return res.json({ message: "Past bookings can't be modified" });
  }

  const conflictingBooking = await Booking.findOne({
    where: {
      id: { [Op.not]: booking.id },
      spotId: booking.spotId,
      [Op.or]: [
        { startDate: { [Op.between]: [newStartDate, newEndDate] } },
        { endDate: { [Op.between]: [newStartDate, newEndDate] } },
      ],
    },
  });

  if (conflictingBooking) {
    res.status(403);
    return res.json({
      message: "Spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  await booking.update({
    startDate,
    endDate,
  });

  res.json(booking);
});

//delete a booking
router.delete("/:bookingId", requireAuth, async (req, res) => {
  const bookingId = req.params.bookingId;
  const userId = req.user.id;

  const booking = await Booking.findByPk(bookingId, {
    include: {
      model: Spot,
      attributes: ["ownerId"],
    },
  });

  if (booking) {
    if (booking.userId === userId) {
      const currentDate = new Date();
      if (booking.startDate > currentDate) {
        await booking.destroy();

        return res.status(200).json({ message: "Successfully deleted" });
      } else {
        return res.status(403).json({
          message: "Bookings that have been started can't be deleted",
        });
      }
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this booking" });
    }
  } else {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }
});

module.exports = router;
