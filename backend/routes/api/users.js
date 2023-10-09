const bcrypt = require("bcryptjs");
const express = require("express");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { handleValidationErrors } = require("../../utils/validation");
const { User } = require("../../db/models");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email"),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Username is required"),
  check("username").not().isEmail().withMessage("Username is required"),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  check("password") // turning off due to example from sign up a user readme.
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

// Sign up
router.post("", validateSignup, async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {}),
    });
  }

  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    return res.status(500).json({
      message: "User already exists",
      errors: {
        email: "User with that email already exists",
      },
    });
  }

  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    return res.status(500).json({
      message: "User already exists",
      errors: {
        username: "User with that username already exists",
      },
    });
  }

  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

module.exports = router;
