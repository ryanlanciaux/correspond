# Correspond - A module for establishing Peer-to-peer WebRTC connections with React

This repository consists of two main packages: **correspond** and **correspond-signaling**.

**correspond** Is the series of React components and helpers for establishing a peer-to-peer WebRTC connection through the correspond-signaling server.

**correspond-signaling** Establishes a peer-to-peer WebRTC connection through WebSockets initially.

## Quick start

First, Create two projects, a server-side node application that will work as the signaling layer for the WebRTC connection and a React front-end application.

### Server

- Add the signaling module. `yarn add correspond-signaling` (or `npm install correspond-signaling`)

- Create an instance of the signaling module:

```javascript
var startSignalingServer = require("correspond-signaling");
startSignalingServer(8088); // run on port 8088
```

- Run the application `node server.js` (or whatever you name the server)

### Client

- Add `correspond` to your React project. `yarn add correspond` (or `npm install correspond`)
- Define a code path for establishing the session as the Host (e.g. something like react/@reach router)

```javascript
  import { Correspondent } from 'correspond'
  ...
  <Correspondent socketAddress={SOCKET_ADDRESS}>
    {connectionProps => <Host {...connectionProps} />}
  </Correspondent>
```

- Define another code path for establishing a session as a client

```javascript
  import { Correspondent } from 'correspond'
  ...
  <Correspondent socketAddress={SOCKET_ADDRESS}>
    {connectionProps => <Client {...connectionProps} />}
  </Correspondent>
```

- Create Host component using the `Host` container component from `correspond`

```javascript
import { Host } from "correspond";
...
  <Host {...props}>
    {({
      hasSocketConnection,
      hasDataChannel,
      sendMessage,
      accessCode,
      subscribe
    }) => {
      ...
    }
```

- Create a Client component using the `Client` container component from `correspond`

```javascript
import { Client } from "correspond";
...
  <ClientWrapper {...props}>
    {({
      hasDataChannel,
      sendMessage,
      subscribe,
      establishConnectionWithKey
    }) => ( /* standard component stuff using these props*/ )}
  </ClientWrapper>
```

## Examples

See the examples under the `packages/example-*` directories
