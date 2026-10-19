import mongoose from "mongoose";
import "@/models/User";
import "@/models/Job";
import "@/models/Candidate";
import "@/models/Interview";
import "@/models/CandidateActivity";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const LOCAL_FALLBACK_URI = "mongodb://127.0.0.1:27017/mini_ats";

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI;

  if (!primaryUri && !LOCAL_FALLBACK_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 4000,
    };

    const targetUri = primaryUri || LOCAL_FALLBACK_URI;

    cached.promise = mongoose
      .connect(targetUri, opts)
      .catch(async (primaryError) => {
        // In local development, if primary connection fails (e.g. Atlas IP whitelist restriction), fallback to local MongoDB
        if (process.env.NODE_ENV !== "production" && targetUri !== LOCAL_FALLBACK_URI) {
          console.warn(
            "⚠️ Primary MongoDB connection failed (check Atlas IP whitelist). Falling back to local MongoDB:",
            LOCAL_FALLBACK_URI
          );
          return mongoose.connect(LOCAL_FALLBACK_URI, {
            ...opts,
            serverSelectionTimeoutMS: 3000,
          });
        }
        throw primaryError;
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
