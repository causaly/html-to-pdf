# html-to-pdf

![html-to-pdf](https://github.com/user-attachments/assets/9aa9e5d7-462a-4c75-9e2e-102df07d3053)

A Node.js service that converts HTML content to PDF using Puppeteer. Designed to be deployed as a containerized service.

[![Build Status](https://github.com/causaly/html-to-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/causaly/html-to-pdf/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fcausaly%2Fhtml--to--pdf-blue)](https://github.com/causaly/html-to-pdf/pkgs/container/html-to-pdf)

## Features

- **Built-in HTML sanitization** to prevent XSS attacks
- **Docker support** for easy deployment
- **Header and footer support** with automatic margin adjustment

## Getting Started

### Docker

1. **Pull the service:**

   ```bash
   docker pull ghcr.io/causaly/html-to-pdf
   ```

2. **Run the service:**

   ```bash
   docker run -p 8087:8087 ghcr.io/causaly/html-to-pdf
   ```

**Requirements:** Docker 20.x or higher

### Development

**Requirements:** Node.js v22.x or higher

1. **Install dependencies:**

   ```bash
   # Chrome will be downloaded automatically
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

### Production

1. **Install dependencies:**

   ```bash
   # Chrome will be downloaded automatically
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Start production server:**

   ```bash
   npm start
   ```

The service will be available at `http://localhost:8087`.

## Usage

### Basic Example

```bash
curl -X POST http://localhost:8087 \
  -H "Content-Type: application/json" \
  -d '{
    "body": "<html><body><h1>Hello World</h1></body></html>",
    "filename": "document.pdf"
  }' \
  --output document.pdf
```

### With Headers and Footers

```bash
curl -X POST http://localhost:8087 \
  -H "Content-Type: application/json" \
  -d '{
    "body": "<html><body><h1>My Document</h1><p>Content here...</p></body></html>",
    "header": "<div style=\"font-size: 10px; text-align: center;\">Document Header</div>",
    "footer": "<div style=\"font-size: 10px; text-align: center;\">Page <span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></div>",
    "filename": "document.pdf"
  }' \
  --output document.pdf
```

### API Reference

```http
POST /
Content-Type: application/json
```

**Request Body:**

| Field      | Type   | Required | Description                                              |
| ---------- | ------ | -------- | -------------------------------------------------------- |
| `body`     | string | Yes      | Valid HTML string for the main content                   |
| `filename` | string | No       | Custom filename for the PDF (defaults to auto-generated) |
| `header`   | string | No       | HTML string for page header                              |
| `footer`   | string | No       | HTML string for page footer                              |

**Example Request:**

```json
{
  "body": "<html><body><h1>Hello World</h1></body></html>",
  "filename": "document.pdf",
  "header": "<div style='font-size: 10px; text-align: center;'>Document Header</div>",
  "footer": "<div style='font-size: 10px; text-align: center;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>"
}
```

**Success Response (200):**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="[filename]"`
- Body: PDF file buffer

**Error Responses:**

**Validation Error (400):**

```json
{
  "message": "A validation error occurred while creating the PDF.",
  "reason": "Validation error: Expected string, received undefined at \"body\""
}
```

**Internal Error (500):**

```json
{
  "message": "An internal error occurred while creating the PDF.",
  "reason": "Error message details"
}
```

## Configuration

The service requires basic configuration via environment variables:

| Variable               | Required | Default                                              | Description                                          |
| ---------------------- | -------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `HOST`                 | Yes      | -                                                    | Server host address                                  |
| `PORT`                 | Yes      | -                                                    | Server port                                          |
| `NODE_ENV`             | No       | `development`                                        | Node.js environment                                  |
| `DEPLOY_ENV`           | No       | `development`                                        | Deployment environment                               |
| `LOG_FORMAT`           | No       | `pretty`                                             | Log format (`pretty` or `gcp`)                       |
| `LOG_LEVEL`            | No       | `info`                                               | Log level (`debug`, `info`, `warn`, `error`, `none`) |
| `ROLLBAR_ACCESS_TOKEN` | No       | -                                                    | Rollbar access token for error tracking              |
| `CSP_POLICY`           | No       | Loose policy with `'unsafe-inline'` for script/style | Content Security Policy for generated PDFs           |

### Environment File

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Then customize as needed. See `.env.example` for all available configuration options.

## Development

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   # Edit .env to customize configuration if needed
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Build the image:**

   ```bash
   docker build --platform linux/amd64 -t html-to-pdf .
   ```

2. **Run the container:**

   ```bash
   docker run --platform linux/amd64 -p 8087:8087 html-to-pdf
   ```

3. **Run with environment variables:**

   ```bash
   docker run --platform linux/amd64 -p 8087:8087 \
     -e LOG_LEVEL=debug \
     -e LOG_FORMAT=pretty \
     html-to-pdf
   ```

## Contributing

Source code contributions are most welcome. Please open a PR, ensure the linter is satisfied and all tests pass.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## We are hiring

Causaly is building the world's largest biomedical knowledge platform, using technologies such as TypeScript, React and Node.js. Find out more about our openings at https://jobs.ashbyhq.com/causaly.
