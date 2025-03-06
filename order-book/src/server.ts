import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

interface Balances {
  [key: string]: number;
}

interface User {
  id: string;
  balances: Balances;
}

interface Order {
  userId: string;
  price: number;
  quantity: number;
}

interface OrderRequestBody {
  type: string;
  side: string;
  price?: number;
  quantity: number;
  userId: string;
}

const TICKER = 'Google';
const users: User[] = [
  { id: '1', balances: { 'USD': 10, 'Google': 50000 } },
  { id: '2', balances: { 'USD': 10, 'Google': 50000 } },
];

const bids: Order[] = [];
const asks: Order[] = [];

app.post('/order', (req: Request<{}, any, OrderRequestBody>, res: Response) => {
  const { type, side, price, quantity, userId } = req.body;

  if (!type || !side || !quantity || !userId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  if (type === 'limit' && price === undefined) {
    res.status(400).json({ error: 'Price required for limit orders' });
    return;
  }

  const orderPrice = type === 'market' ? (side === 'bid' ? Number.MAX_VALUE : 0) : price!;
  const remainingQty = fillOrders(side, orderPrice, quantity, userId);

  if (type === 'limit' && remainingQty > 0) {
    const order = { userId, price: orderPrice, quantity: remainingQty };
    if (side === 'bid') {
      bids.push(order);
      bids.sort((a, b) => a.price - b.price);
    } else {
      asks.push(order);
      asks.sort((a, b) => b.price - a.price);
    }
  }
  res.json({ filledQuantity: quantity - remainingQty });
});

app.get('/depth', (req: Request, res: Response) => {
  const depth: { [price: string]: { type: 'bid' | 'ask'; quantity: number } } = {};
  for (const bid of bids) {
    depth[bid.price] = depth[bid.price] || { type: 'bid', quantity: 0 };
    depth[bid.price].quantity += bid.quantity;
  }
  for (const ask of asks) {
    depth[ask.price] = depth[ask.price] || { type: 'ask', quantity: 0 };
    depth[ask.price].quantity += ask.quantity;
  }
  res.json({ depth });
});

app.get('/balance/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = users.find((x) => x.id === userId);
  res.json({ balances: user ? user.balances : { USD: 0, [TICKER]: 0 } });
});

function flipBalance(userId1: string, userId2: string, quantity: number, price: number) {
  const user1 = users.find((x) => x.id === userId1);
  const user2 = users.find((x) => x.id === userId2);
  if (!user1 || !user2) return;
  user1.balances[TICKER] -= quantity;
  user2.balances[TICKER] += quantity;
  user1.balances['USD'] += quantity * price;
  user2.balances['USD'] -= quantity * price;
}

function fillOrders(side: string, price: number, quantity: number, userId: string): number {
  let remainingQty = quantity;
  if (side === 'bid') {
    for (let i = asks.length - 1; i >= 0; i--) {
      if (asks[i].price > price) continue;
      if (asks[i].quantity > remainingQty) {
        asks[i].quantity -= remainingQty;
        flipBalance(asks[i].userId, userId, remainingQty, asks[i].price);
        return 0;
      } else {
        remainingQty -= asks[i].quantity;
        flipBalance(asks[i].userId, userId, asks[i].quantity, asks[i].price);
        asks.pop();
      }
    }
  } else {
    for (let i = bids.length - 1; i >= 0; i--) {
      if (bids[i].price < price) continue;
      if (bids[i].quantity > remainingQty) {
        bids[i].quantity -= remainingQty;
        flipBalance(userId, bids[i].userId, remainingQty, bids[i].price);
        return 0;
      } else {
        remainingQty -= bids[i].quantity;
        flipBalance(userId, bids[i].userId, bids[i].quantity, bids[i].price);
        bids.pop();
      }
    }
  }
  return remainingQty;
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});