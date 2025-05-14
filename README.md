# Todo MCP Server: Empowering AI with Task Management Capabilities.(Sample demo)

This sample project demonstrates how to build a Model Context Protocol (MCP) server for managing a to-do list. By leveraging the MCP standard, this server enables AI agents and other compatible applications to interact with and control to-do list functionalities through a structured and discoverable interface.

## What is an MCP Server?
At its core, an MCP server acts as a bridge between intelligent agents (like AI models) and specific functionalities or data. It exposes these capabilities as "tools" that an AI can understand and use. Think of it as giving an AI a well-organized toolbox, where each tool has a clear purpose and defined way of being used.

The key benefits of using an MCP server include:

- Structured Interaction: MCP provides a standardized way for AIs to understand how to call functions (tools), what parameters they need, and what kind of responses to expect.
- Tool Discovery: An AI can query an MCP server to discover what tools are available and how to use them, making integration more dynamic and less reliant on hardcoded knowledge.
- Extensibility: You can easily add new functionalities (new tools) to your MCP server, allowing the AI to gain new capabilities without needing to be retrained on the core logic.
- Abstraction: The MCP server abstracts away the underlying implementation details (like database interactions or API calls), presenting a clean and consistent interface to the AI.

## Built with FastMCP TypeScript Library
This Todo MCP Server is built using the [FastMCP](https://github.com/punkpeye/fastmcp)  TypeScript library. FastMCP simplifies the process of creating MCP-compliant servers in Node.js and TypeScript. It provides a robust framework for defining tools, handling parameters, and managing the communication with MCP clients.

## Integrating with the Todo API as MCP Tools
This solution takes an interesting approach: instead of directly managing the to-do list within the MCP server itself, it acts as an intermediary by calling an existing RESTful Todo API. This means the MCP server exposes tools that, behind the scenes, interact with your dedicated Todo API to perform actions like creating, searching, updating, and removing todos.

Here's a breakdown of why and how this works:

- Leveraging Existing Infrastructure: If you already have a well-established Todo API with its own data storage (like a PostgreSQL database) and business logic, the MCP server can build upon this foundation instead of duplicating it.
- Abstraction for the AI: The AI interacting with the MCP server doesn't need to know the intricacies of your REST API (e.g., specific endpoints, HTTP methods, request bodies). The MCP server presents a simpler, tool-based interface.
- Focus on Orchestration: The MCP server's role becomes orchestrating the interaction between the AI's requests and your backend API. It translates the AI's tool calls into the necessary API requests and formats the API responses back for the AI.

In essence, the MCP server defines tools like add_todos, search_todos, update_todos, and remove_todos. When an AI agent calls one of these tools with the required parameters, the MCP server will:

Receive the tool call and its arguments.
- Construct the appropriate HTTP request to your Todo API based on the called tool and the provided arguments.
- Send the request to your Todo API.
- Receive the response from the Todo API.
- Format the API response into a structured result that the AI can understand, as defined by the MCP standard and the tool's returns schema.
- Return the result to the AI agent.

This design allows you to expose your existing Todo API's functionality to AI agents in a standardized and easily consumable way through the MCP protocol.

## Setting Up the PostgreSQL Database
Before running the Todo API and the MCP server, you need to ensure your PostgreSQL database is set up and the necessary tables are created. Follow these steps within the Todo_Db_Library project solution:

- Navigate to the Todo_Db_Library project directory in your terminal.

- Generate Database Migration (if needed): If you've made changes to your database entities (models), you'll need to generate a migration file to reflect those changes. Run the following command:
```bash
npm run typeorm:generate
```
This command will typically create a new migration file in your project's migrations directory. Review the generated file to ensure it accurately reflects your intended database schema changes.

Apply Database Migrations: Once the migration file (or if you have existing migrations) is ready, apply them to your PostgreSQL database using the following command:
```bash
npm run typeorm:migrate
```
This command will execute any pending migration files, creating or updating the tables in your todo database according to your defined entities.

## Running the Todo REST API
With the database set up, you can now start the Todo REST API. This API will be the backend that our MCP server communicates with. Follow these steps within the Todo_API project solution:

- Navigate to the Todo_API project directory in your terminal.
- Run the Development Server: Start the API development server using the following command:
```bash
npm run dev
```
This command will typically start the API server and enable features like hot-reloading for development. Keep this server running in the background.

- Ensure Redis Docker is Running: This Todo API relies on Redis for caching and potentially other functionalities like rate limiting. Make sure you have a Redis Docker container running. If you don't have it set up, you'll need to install Docker and then run a Redis container. A basic command to run a Redis container is:
```bash
docker run -d -p 6379:6379 redis
```

- .env Configuration: Before running the API, ensure you have a .env file in the Todo_API project root with the following configuration. Adjust the values as needed to match your local environment, especially the database and Redis connection details.
```.env
# PORT
PORT = 3000

# LOG
LOG_FORMAT = dev
LOG_DIR = ../logs

# Database
DB_HOST = localhost
#Local Docker
#DB_HOST=host.docker.internal
DB_PORT = 5432
DB_USERNAME = postgres
DB_PASSWORD = root
DB_DATABASE = todo

# Redis
REDIS_HOST = 127.0.0.1
#Local Docker
#DB_HOST=host.docker.internal
#REDIS_USERNAME = username
#REDIS_PASSWORD = password
REDIS_DB = 0
REDIS_PORT = 6379

#AES
ENCRYPTION_KEY=RWw5ejc0Wzjq0i0T2ZTZhcYu44fQI5M7

#Rate Limit Size
RATE_LIMITER=100
```

## Running the Todo MCP Server
With the database set up and the Todo API running, you can now start the MCP server. This server will expose the tools that AI agents can use to interact with your Todo API. Follow these steps within the MCP_server project solution:

- Navigate to the MCP_server project directory in your terminal.
- Run the MCP Inspector: For this project, you've indicated using npm run mcp-inspector. This command likely starts the FastMCP inspector, a tool that helps you visualize and test your MCP server's capabilities. Run the command:
```bash
npm run mcp-inspector
```
The FastMCP inspector will typically start a web interface (usually accessible in your browser) where you can see the defined tools, their parameters, and even simulate calls to them. This is a valuable tool for development and testing.
- .env Configuration: Before running the MCP server, ensure you have a .env file in the MCP_server project root with the following configuration:
```.env
MCP_SERVER_NAME=todo_mcp_server
BASE_URL=http://localhost:3000
#AES
ENCRYPTION_KEY=RWw5ejc0Wzjq0i0T2ZTZhcYu44fQI5M7
```

## Configuring Claude Desktop to Connect to the Todo MCP Server (Example)
To enable Claude Desktop (or other MCP-compatible clients) to interact with your Todo MCP Server, you'll need to configure it to recognize and connect to your server. The configuration format might vary slightly depending on the client application. For Claude Desktop, you would typically modify its configuration file (e.g., claude_desktop_config.json).
https://github.com/punkpeye/fastmcp?tab=readme-ov-file#how-to-use-with-claude-desktop

Here's an example configuration snippet that you might add to Claude Desktop's configuration to connect to your locally running Todo MCP Server:
```json
{
  "mcpServers": {
    "Todo MCP Server": {
      "command": "npx",
      "args": [
        "start"
      ],
      "cwd": "YOUR_MCP_SOLUTION_PATH"
    }
  }
}
```
Explanation of this configuration:

- "Todo MCP Server": This is a user-friendly name that will identify your MCP server within Claude Desktop.
- "command": "npx": This specifies the command to execute to start your MCP server. It assumes you have a "start" script defined in your MCP_server project's package.json that runs your MCP server (e.g., "start": "node dist/index.js" or similar).
- "args": ["start"]: This provides the argument to the npx command, which in this case is the name of the npm script to run.
- "cwd": "C:\\MCP_Server": This sets the current working directory to your MCP_server project directory before executing the command. This is important so that npx can find the package.json file and run the specified script correctly. Remember to replace this path with the actual path to your MCP_server project on your system.

### Next Steps:

Once the MCP server is running (and the inspector is accessible), you can:

- Explore the defined tools: Use the inspector's interface to see the add_todos, search_todos, update_todos, and remove_todos tools, along with their parameters and descriptions.
- Simulate tool calls: Use the inspector to send test requests to your MCP server with different parameters and observe the responses. This allows you to verify that the MCP server is correctly interacting with your Todo API and formatting the results.
- Integrate with an AI agent: The ultimate goal is to connect this MCP server to an AI agent that understands the MCP protocol. The AI can then discover the available tools and use them to manage the to-do list based on user requests or its own reasoning.
- This setup provides a robust and modular way to manage your to-do list and expose its functionalities to intelligent agents through the power of the Model Context Protocol and the FastMCP library. Remember to consult the FastMCP documentation for more advanced features and configuration options.