# Node Docker Pull

A small Express application for pulling Docker images and viewing layer-by-layer progress in a browser.

The web interface connects to the server with Server-Sent Events (SSE), so pull status is displayed as Docker reports it. The server also exposes a simple health-check endpoint for container orchestration and reverse proxies.

## Requirements

- Node.js 18 or newer
- npm
- Access to a Docker Engine socket
- The `src/puller.js` module, exporting a `DockerPuller` class

By default, Dockerode expects the local Docker socket at `/var/run/docker.sock`. When running the app in a container, mount that socket into the container and ensure the process can read and write to it.

## Install

```bash
npm install
```

Start the server with the default port:

```bash
npm start
```

The application listens on `http://localhost:3000`. Set `PORT` to use another port:

```bash
PORT=8080 npm start
```

## Usage

1. Open the application in a browser.
2. Enter an image reference, such as `mariadb:latest` or `nginx:1.27`.
3. Select **Pull**. The page displays the current Docker status, layer progress, and completion or error information.

If no tag is supplied, the application uses `latest`. Registry hosts with ports are supported, for example `registry.example.com:5000/team/image:1.0`.

## HTTP endpoints

### `GET /`

Serves the browser interface from `public/index.html`.

### `GET /health`

Returns a JSON health response:

```json
{"ok":true}
```

### `GET /api/pull`

Starts a pull and streams progress as SSE events.

Query parameters:

| Parameter | Default | Description |
| --- | --- | --- |
| `image` | `mariadb` | Image name, optionally including a registry or namespace |
| `tag` | `latest` | Image tag |

Example:

```bash
curl -N "http://localhost:3000/api/pull?image=nginx&tag=latest"
```

The response uses these event types:

- `progress`: Docker layer or status information
- `done`: emitted after the pull completes
- `error`: emitted when the pull fails

## Docker access and security

Anyone who can reach `/api/pull` can request pulls through the Docker daemon, which may provide root-equivalent access to the host. Run this service only on a trusted network, restrict access with a reverse proxy or firewall, and add authentication before exposing it beyond localhost.

## Project structure

```text
public/index.html  Browser UI
src/index.js       Express server and SSE endpoint
src/puller.js      Docker pull implementation
package.json       npm metadata and start script
```

## Troubleshooting

- **Cannot connect to Docker:** verify that Docker is running and that the process has access to `/var/run/docker.sock`.
- **The server exits with `Cannot find module './puller'`:** add or restore `src/puller.js` with the `DockerPuller` export expected by `src/index.js`.
- **The browser shows no progress:** confirm that the server is reachable and that a proxy is not buffering or caching `text/event-stream` responses.

