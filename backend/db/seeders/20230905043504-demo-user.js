"use strict";

const { User } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Users";
    await User.bulkCreate(
      [
        {
          firstName: "Alex",
          lastName: "Thoo",
          email: "alex.thoo@alex.com",
          username: "ggnore",
          hashedPassword: bcrypt.hashSync("password"),
        },
        {
          firstName: "Yoshi",
          lastName: "Klee Kai",
          email: "Yoshi@kleekai.com",
          username: "Yoshinoya",
          hashedPassword: bcrypt.hashSync("password2"),
        },
        {
          firstName: "Bowser",
          lastName: "JRT",
          email: "bowser@jrt.com",
          username: "thegrumpyman",
          hashedPassword: bcrypt.hashSync("password3"),
        },
      ],
      { validate: true }
    );
  },

  //   async down(queryInterface, Sequelize) {
  //     options.tableName = "Users";
  //     const Op = Sequelize.Op;
  //     return queryInterface.bulkDelete(options, {
  //       username: { [Op.in]: ["ggnore", "Yoshinoya", "thegrumpyman"] },
  //     });
  //   },
  // };

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    return queryInterface.bulkDelete(options);
  },
};
