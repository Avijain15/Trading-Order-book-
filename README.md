
Order Book
It is a simple TypeScript-based trading system simulation built with Express.js. It allows users to place market and limit orders for a single ticker ("Google"), matches bids (buy orders) and asks (sell orders), and manages user balances in USD and stock quantities. This project is intended for educational purposes, demonstrating basic order matching and balance management in a trading system.
Features
Place market and limit orders (buy/sell)
Automatic order matching based on price and quantity
View the current order book depth (bids and asks)
Check user balances (USD and stock)
In-memory storage for users, bids, and asks (non-persistent)
Technologies Used
TypeScript: For type-safe JavaScript code
Express.js: Web framework for building the API
Node.js: JavaScript runtime environment
body-parser: Middleware for parsing JSON requests
Installation
Follow these steps to set up the project locally:
Clone the repository:
bash
git clone https://github.com/Avijain15/Trading-Order-book-.git
Navigate to the project directory:
bash
cd order-book
Install dependencies:
bash
npm install
Compile TypeScript to JavaScript:
bash
npx tsc
Note: This assumes a tsconfig.json file is included with "outDir": "dist". If not, ensure your TypeScript files are compiled to the correct output directory.
Usage
Start the server:
bash
node dist/server.js
The server will run on http://localhost:3000.
Interact with the API: Use tools like Postman or curl to send requests to the endpoints listed below.
Note: Data is stored in memory and will be lost when the server restarts.
API Endpoints
1. POST /order
Description: Place a new order (market or limit).
Request Body:
json
{
  "type": "market" | "limit",
  "side": "bid" | "ask",
  "price": number,  // Required for limit orders
  "quantity": number,
  "userId": string
}
Response:
json
{
  "filledQuantity": number
}
2. GET /depth
Description: Retrieve the current order book depth.
Response:
json
{
  "depth": {
    "price": {
      "type": "bid" | "ask",
      "quantity": number
    }
  }
}
3. GET /balance/:userId
Description: Get the balance of a specific user.
Parameters: userId (in URL)
Response:
json
{
  "balances": {
    "USD": number,
    "Google": number
  }
}
Contributing
Contributions are welcome! To contribute:
Fork the repository.
Create a new branch for your changes.
Make your modifications, following the existing code style.
Submit a pull request with a clear description of your updates.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Additional Notes
Replace your-username in the clone command with your actual GitHub username.
If your project’s output directory or main file differs from dist/server.js, adjust the usage instructions accordingly.
Ensure a LICENSE file exists in the repository if you reference it.
