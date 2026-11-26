process.env.DB_AUTH = "windows";
if (!process.env.DB_HOST) process.env.DB_HOST = "localhost";

await import("../api/src/index.js");
