# WebSocket multi-user-blog

This section explains how real-time WebSocket communication works in the multi-user blog app using WebSocket. It uses Socket.IO to let clients and the server send and receive events instantly.
All communication happens inside a namespace called _/multiuserblog_, and users must be authenticated with a JWT token before they can connect.

## Server Initialization

WebSocket functionality is integrated into the main HTTP server. An instance of Socket.IO is bound to the existing HTTP server and passed to a dedicated initializer class, `SocketIoInitializer`.

## Namespace Configuration (SocketIoInitializer)

All WebSocket communication takes place within the /multiuserblog namespace. This namespace is protected, and every socket connection goes through two middlewares:

- _socketAuthMiddleware_: Authenticates the user using a JWT token

- _onConnectionMiddleware_: Sends initial connection data and joins the user to a specific room

This setup ensures that all clients are properly authenticated and initialized when connecting to the namespace.

## JWT Authentication Middleware

During the handshake phase, the client must provide a JWT token through the `auth.token field`. The authentication middleware decodes and verifies this token:

- If valid, the user is attached to the socket as `socket.loggedUser`

- If invalid or missing, the connection is rejected with a custom UnauthorizedException

This guarantees that each connected socket represents a legitimate, authenticated user.

## Connection Middleware

After successful authentication, the onConnectionMiddleware executes the following logic:

- Sets the user’s status to online (isOnline: true) in the database upon connection

- Emits a `connected event` back to the client, including the authenticated user’s details

- Adds the socket to a unique room identified by the user's sub (subject ID)

- Initializes a set of event handlers that listen for real-time client-side actions such as creating, updating, or deleting posts and comments, managing tags, and toggling likes

- Listens for the disconnect event and updates the user’s status to offline (isOnline: false) and sets the lastSeen timestamp

This flow ensures that the user’s online presence is tracked in real-time.

## SocketFixtures

SocketFixtures is a utility designed to simplify the creation of Socket.IO clients for testing purposes. It supports both authenticated and unauthenticated scenarios:

- When authentication is enabled, it automatically generates a short-lived JWT and attaches it to the connection request

- Clients are configured to connect specifically to the /multiuserblog namespace using WebSocket transport

- Connections are initialized in a controlled way, allowing you to manage when the client actually connects (for setup in tests)

## ResultSynchronizer

ResultSynchronizer is a helper utility for handling asynchronous WebSocket events during tests. It tracks how many times a specific event or condition has occurred and allows your test to wait until the specified condition is met.

It monitors event counts on a short interval and resolves once the expected number of events has been triggered.

If the expected count isn’t reached within a timeout window, it fails the test with a clear error.

## Flow

- The client attempts to connect to `http://localhost:8026/multiuserblog`, providing a valid JWT token

- The authentication middleware verifies the token and attaches the user to the socket context

- The connection middleware emits a confirmation event (connected) and subscribes the socket to a user-specific room

- The client is now fully connected and can interact with real-time features of the application
