// test-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMCPServer() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    env: Object.fromEntries(
      Object.entries(process.env).filter(([_, v]) => typeof v === "string") as [
        string,
        string
      ][]
    ),
  });

  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  try {
    // List available tools
    const tools = await client.listTools();
    console.log("Available tools:", JSON.stringify(tools, null, 2));

    // Test login_user tool
    const result = await client.callTool({
      name: "login_user",
      arguments: {
        username: "*********@*****.com",
        password: "*********",
      },
    });

    console.log("Login result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

testMCPServer();
