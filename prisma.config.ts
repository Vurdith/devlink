import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!datasourceUrl) {
  throw new Error("Missing DATABASE_URL (or DIRECT_URL) environment variable");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
});


