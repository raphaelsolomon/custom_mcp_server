// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MercuryServer } from "./mercury/index.js";

class McpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "All MCP server", version: "0.0.1" },
      { capabilities: { tools: {} } }
    );

    this.setuphandlers();
  }

  private setuphandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "login_user",
          description: "Login a user with their username and password",
          inputSchema: {
            type: "object",
            properties: {
              username: {
                type: "string",
                format: "email",
                description: "The user's email address"
              },
              password: {
                type: "string",
                minLength: 8,
                description: "The user's password"
              }
            },
            required: ["username", "password"]
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "login_user":
          return new MercuryServer(name).execute(args!);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Server started successfully");
  }
}

// Start the server
const server = new McpServer();
server.start().catch(console.error);