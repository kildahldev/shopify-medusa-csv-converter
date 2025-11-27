# Shopify to MedusaJS CSV Converter

A simple, client-side tool to convert Shopify product exports for MedusaJS.

## Features

- **Client-Side Processing**: All data stays in your browser
- **HTML to Markdown**: Optional conversion of product descriptions
- **Smart Status Mapping**: Shopify's `Published` → Medusa's `published`/`draft`
- **Currency Support**: Specify target currency (EUR, USD, etc.)

## Usage

1. Export your products from Shopify (CSV format)
2. Upload the CSV file
3. Choose your target currency
4. (Optional) Enable HTML to Markdown conversion
5. Download the MedusaJS-compatible CSV
6. Import into MedusaJS

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React + TypeScript
- Vite
- TailwindCSS v4
- PapaParse (CSV processing)
- Turndown (HTML→Markdown)

## License

MIT
