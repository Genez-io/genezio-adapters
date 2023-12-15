# Genezio Adapters for Web Frameworks

This project provides a set of adapters that enable the integration of the Genezio platform with popular web frameworks such as Express, Fastify, and more. These adapters are designed to facilitate the handling of Genezio RPC requests within these frameworks, allowing for a seamless and efficient integration.

## Features

- **Express Adapter**: Leverages the power of Express to handle Genezio RPC requests with ease.
- **Fastify Adapter**: Utilizes the high-performance Fastify framework for efficient Genezio RPC handling. [in progress]
- **Easy Integration**: Simple and straightforward integration process with your existing web application.
- **Flexible Configuration**: Adaptable to various use cases and configurations.
- **Scalable**: Designed to handle high loads, making it suitable for both small and large-scale applications.

## Installation

Install the adapter for your desired web framework using npm:

```bash
npm install @genezio/adapters
```

## Usage

```
import  express from 'express';
import * as genezioAdapters from "@genezio/adapters";
import { HelloWorldService } from './hello.js';
import { ProductService, ShoppingCardService } from './hello.js';
const app = express();
const port = 8881;

app.use(express.json());
app.post('/genezio', genezioAdapters.createExpressRouter([HelloWorldService, ProductService, ShoppingCardService]));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
```

## Contributing

Contributions are welcome!
