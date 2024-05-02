import dotenv from "dotenv";

dotenv.config();

if (process.env.PORT == null || process.env.PORT == undefined) {
  console.log("falta variable de entorno PORT");
  process.exit(1);
}

const config = {
  isProd: process.env.NODE_ENV === "production",
  port: +process.env.PORT!,
};

export default config;
