# Claim Request System (CRS)

A comprehensive financial claim management system built with React, TypeScript, and Vite.

## Features

- 🔐 Multi-role support (Admin, Finance, Approver, Staff)
- 🌐 Internationalization (English, Japanese, Vietnamese)
- 📱 Responsive design with modern UI
- 📊 Real-time data visualization
- 🔄 Workflow approval process

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Ant Design
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **Charts**: Recharts
- **Code Quality**: ESLint + Prettier

## Prerequisites

```bash
node -v # v20.x or later
pnpm -v # 8.x or later
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ClaimProject

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:5173
```

### Production Build

```bash
# Create production build
pnpm build

# Preview production build
pnpm preview
```

### Docker Support

```bash
# Development environment
docker compose up vite-dev

# Production environment
docker compose up vite-prod

# Stop containers
docker compose down
```

## Project Structure

```
ClaimProject/
├── src/
│   ├── apis/          # API configurations and services
│   ├── components/    # Reusable React components
│   ├── hooks/         # Custom React hooks
│   ├── interfaces/    # TypeScript interfaces
│   ├── locales/       # i18n translation files
│   ├── pages/         # Page components
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
├── public/            # Static assets
└── package.json       # Project dependencies and scripts
```

## Available Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `pnpm dev`          | Start development server |
| `pnpm build`        | Create production build  |
| `pnpm preview`      | Preview production build |
| `pnpm lint`         | Run ESLint               |
| `pnpm prettier:fix` | Fix code formatting      |

## Environment Configuration

### Development

```env
VITE_API_URL=https://localhost:5001/api/v1
VITE_ENV=development
```

### Production

```env
VITE_API_URL=https://crsojt.azurewebsites.net/api/v1
VITE_ENV=production
```

## Features by Role

### Admin

- Staff management
- Project management
- System configuration

### Finance

- Process claim payments
- Export financial reports
- Review claim history

### Approver

- Review claim requests
- Approve/Reject claims
- Return claims for revision

### Staff

- Submit claims
- Track claim status
- View claim history

## Contributing

1. Follow the ESLint configuration
2. Use TypeScript types
3. Follow the i18n pattern for new texts
4. Write clean, documented code
5. Create meaningful commit messages

## Authors

Team 1 HCM25_CPL_NET_04
