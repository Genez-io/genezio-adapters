import type * as express from 'express';

/**
 * Type representing any class constructor.
 */
type AnyClass = new (...args: any[]) => any;

/**
 * Creates an Express middleware for handling Genezio RPC requests. 
 * This middleware dynamically dispatches requests to appropriate class instances based on the RPC method name.
 *
 * The classes are instantiated at middleware initialization and mapped to their respective class names. 
 * When a request is received, the middleware parses the 'method' property from the request body to determine 
 * the target class and method. It then forwards the request to the appropriate method of the relevant class instance.
 *
 * The classes passed to this middleware should be structured in a way that their methods can handle Express request objects.
 * Each method should return a response that will be sent back to the client. The middleware handles various HTTP and RPC errors, 
 * ensuring proper response formatting according to the JSON-RPC 2.0 specification.
 *
 * Example Usage:
 * ```
 * app.use('/api/rpc', createGenezioMiddleware([UserService, ProductService]));
 * ```
 * In this example, `UserService` and `ProductService` are classes with methods corresponding to the RPC method names.
 *
 * @param classes An array of class constructors. These classes should contain methods that correspond to RPC methods.
 * @returns An Express handler (middleware) that processes the incoming Genezio RPC requests.
 */
export function createExpressRouter(classes: AnyClass[]): express.Handler {
    const instances: Map<string, any> = new Map()
    classes.forEach((c: any) => {
        const instance = new c();
        instances.set(c.name as string, instance)
    })

    return async (req, res) => {
        // The body should be taken from 'req.body', not 'body' directly or 'event.body'.
        if (!req.body || (req.body && req.body["jsonrpc"] === "2.0")) {
            // 'components' is not defined anywhere. Assuming you want to parse a URL path parameter.

            if (!req.body.method) {
                 res.status(400).json({
                    error: "Request invalid. Missing 'method' property from body."
                });
                return;
            }
            const methodComponents = req.body.method.split('.')

            if (methodComponents.length < 2) {
                 res.status(400).json({
                    error: "Request invalid. Incorrect 'method' property format. It should be <classname.methodname>."
                });
                return;
            }

            const className = methodComponents[0];
            const method = methodComponents.pop();
            const instance = instances.get(className)

            if (!instance) {
                res.status(404).json({
                    error: `Class ${className} not found.`
                });
                return;
            }

            // We don't need to reconstruct the 'req' object, it's already available.
            if (!instance[method]) { // Assuming 'classes' is an object containing methods.
                res.status(404).json({
                    error: `Method ${method} not found`
                });
                return;
            }

            try {
                const response = await instance[method](...(req.body.params || [])
);

                // Express handles the status code, so you can set it directly on the response object.
                if (!response.statusCode) {
                    res.status(200);
                } else {
                    res.status(response.statusCode);
                }


                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({
                    jsonrpc: "2.0",
                    result: response,
                    id: null
                });
            } catch (error) {
                res.status(500).json({
                    error: "Internal server error"
                });
            }
        }
    }
}
