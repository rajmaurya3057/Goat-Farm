const mongoose = require("mongoose");
const logger = require("./logger");

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/gfms";
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  maxPoolSize: 10,
};

const getSafeMongoUri = (uri) => {
  if (!uri) return "MONGO_URI is not defined";
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//<username>:<password>@");
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || DEFAULT_LOCAL_URI;
  const fallbackUri = DEFAULT_LOCAL_URI;

  try {
    await mongoose.connect(primaryUri, MONGO_OPTIONS);
    logger.info("MongoDB connected", { uri: getSafeMongoUri(primaryUri) });
  } catch (error) {
    if (primaryUri !== fallbackUri && process.env.NODE_ENV !== "production") {
      console.log("ATLAS ERROR:");
      console.log(error);
      logger.warn(
        "Primary MongoDB connection failed, attempting local fallback",
        {
          primary: getSafeMongoUri(primaryUri),
          fallback: getSafeMongoUri(fallbackUri),
          message: error.message,
        },
      );

      try {
        await mongoose.connect(fallbackUri, MONGO_OPTIONS);
        logger.info("MongoDB connected using local fallback", {
          uri: getSafeMongoUri(fallbackUri),
        });
        return;
      } catch (fallbackError) {
        logger.error("MongoDB fallback connection failed", {
          message: fallbackError.message,
          uri: getSafeMongoUri(fallbackUri),
        });
      }
    }

    logger.error("MongoDB connection failed", {
      message: error.message,
      uri: getSafeMongoUri(primaryUri),
      name: error.name,
    });
    throw new Error(
      `MongoDB connection failed. Check that your Atlas IP is whitelisted and that MONGO_URI is correct. ${error.message}`,
    );
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};

module.exports = { connectDB, disconnectDB };
