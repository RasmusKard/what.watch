import { createClient } from "@redis/client";
const redisClient = createClient({ url: "redis://default@redis" });

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

export default redisClient;
