// src/http-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MercuryServer } from "./mercury/index.js";
import express from "express";
import cors from "cors";

class HttpMcpServer {
  private server: Server;
  private app: express.Application;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    
    // Setup express middleware
    this.app.use(cors());
    this.app.use(express.json());
    
    this.server = new Server(
      { name: "All MCP server", version: "0.0.1" },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
    this.setupRoutes();
  }

  private setupHandlers() {
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

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        server: 'Mercury MCP Server'
      });
    });

    // SSE endpoint for MCP communication
    this.app.get('/stream', async (req, res) => {
      const transport = new SSEServerTransport('/stream', res);
      await this.server.connect(transport);
    });
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.port, () => {
        console.error(`🚀 MCP HTTP Server started successfully on port ${this.port}`);
        console.error(`📡 Stream endpoint: http://localhost:${this.port}/stream`);
        console.error(`🔍 Health check: http://localhost:${this.port}/health`);
        resolve();
      });
    });
  }
}

// Start the HTTP server
const port = parseInt(process.env.PORT || '4000');
const server = new HttpMcpServer(port);
server.start().catch(console.error);