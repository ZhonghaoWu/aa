const { sequelize } = require("./db/models");

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
});

console.log("Checking if schema exists...");
sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  console.log("Existing schemas:", data);
  if (!data.includes(process.env.SCHEMA)) {
    console.log("Schema not found. Creating...");
    await sequelize.createSchema(process.env.SCHEMA);
    console.log("Schema created successfully.");
  } else {
    console.log("Schema already exists.");
  }
}).catch(error => {
  console.error("Error occurred:", error);
});
