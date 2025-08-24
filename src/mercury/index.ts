// src/mercury/index.ts
import { createApolloClient } from "../utilities/client.js";
import { env } from "../config/env.js";
import { LOGIN_USER } from "./schemas/index.js";
import type { ApolloClient } from "@apollo/client/core";

type LoginUserResponse = {
  login: {
    access_token: string;
    user: any;
  };
};

export class MercuryServer {
  private client: ApolloClient;
  private name: string;

  constructor(name: string) {
    this.name = name;
    if (!env || !env.MERCURY_GRAPHQL_URL) {
      throw new Error("MERCURY_GRAPHQL_URL is not defined in env");
    }

    this.client = createApolloClient(env.MERCURY_GRAPHQL_URL);
  }

  async execute(args: Record<string, unknown>) {
    try {
      switch (this.name) {
        case "login_user":
          return await this.loginUser(args);
        default:
          throw new Error(`Unknown tool: ${this.name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  private async loginUser(args: { [key: string]: any }) {
    const { username, password } = args;

    const { data, error } = await this.client.mutate<LoginUserResponse>({
      mutation: LOGIN_USER,
      variables: { input: { username, password } },
      context: { headers: {} },
    });

    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }

    const loginData = data?.login;
    
    const result = {
      access_token: `Bearer ${loginData?.access_token}`,
      user: loginData?.user || null,
    };

    return {
      content: [
        {
          type: "text",
          text: `Login successful:\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  }
}