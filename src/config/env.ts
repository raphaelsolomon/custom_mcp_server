import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MERCURY_GRAPHQL_URL: z.url(),
});


export function validateEnv() {
  try {
    // Parse and validate environment variables
    const env = envSchema.parse(process.env);

    // Return the validated and transformed environment
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((e) => {
        return `${e.path.join(".")}: ${e.message}`;
      });

      console.error("❌ Invalid environment variables:");
      console.error(errorMessages.join("\n"));
      process.exit(1);
    } else {
      console.error("❌ An unknown error occurred during env validation");
      console.error(error);
      process.exit(1);
    }
  }
}

// Export the typed environment
export const env = validateEnv();
