"use strict";
const { Spot } = require("../models");

let options = {};

if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Spots";
    await Spot.bulkCreate(
      [
        {
          ownerId: 1,
          address: "200 Park Avenue",
          city: "Manhattan",
          state: "New York",
          country: "USA",
          lat: 40.71284123123,
          lng: -74.006123123,
          name: "Stark Tower",
          description:
            "Tony Stark bought out the 59-story skyscraper and reconfigured it to run sole off of his J.A.R.V.I.S technology.",
          price: 10.99,
        },
        {
          ownerId: 2,
          address: "10880 Malibu Point",
          city: "Malibu",
          state: "California",
          country: "USA",
          lat: 34.0522,
          lng: -118.2437,
          name: "Tony Stark's house",
          description: "Tony Stark's house right next to the beach.",
          price: 15.99,
        },
        {
          ownerId: 3,
          address: "177A Bleecker Street",
          city: "New York",
          state: "New York",
          country: "USA",
          lat: 37.7749,
          lng: -122.4194,
          name: "The Secret Lair of Doctor Strange",
          description: "The secret lair of Doctor St",
          price: 20.99,
        },
      ],
      {
        validate: true,
      }
    );
  },

  //   async down(queryInterface, Sequelize) {
  //     options.tableName = "Spots";
  //     const Op = Sequelize.Op;
  //     return queryInterface.bulkDelete(options, {
  //       name: {
  //         [Op.in]: [
  //           "Central Park",
  //           "Hollywood Walk of Fame",
  //           "Golden Gate Bridge",
  //         ],
  //       },
  //     });
  //   },
  // };

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    return queryInterface.bulkDelete(options);
  },
};
