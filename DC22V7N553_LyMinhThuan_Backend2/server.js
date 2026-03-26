const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

const startServer = async () => {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connected to MongoDB");
    const POST = config.app.port;
    app.listen(config.app.port, () => {
      console.log(`Server is running on port ${POST}`);
    });
  } catch (error) {
    console.error("Cannot connect to MongoDB:", error);
    process.exit(1);
  }
};
startServer();
