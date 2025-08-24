// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MercuryServer } from "./mercury/index.js";
import express, { type Request, type Response } from "express";

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
                description: "The user's email address",
              },
              password: {
                type: "string",
                minLength: 8,
                description: "The user's password",
              },
            },
            required: ["username", "password"],
          },
        },
      ],
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

  getServer() {
    return this.server;
  }
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const server = new McpServer().getServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      console.log("Response closed, cleaning up transport");
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling /mcp request:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: "Internal error" },
      id: null,
    });
  }
});


app.listen(4000, () => {
  console.log("MCP Server listening on port 4000");
})