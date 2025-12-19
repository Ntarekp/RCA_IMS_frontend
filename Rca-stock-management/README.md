# RCA Stock Management System - Frontend

A modern React + TypeScript frontend application for managing school inventory and stock tracking.

## 🚀 Features

- **Dashboard**: Real-time inventory overview with statistics and charts
- **Stock Management**: View, add, and manage inventory items
- **Transactions**: Record and track stock movements (IN/OUT)
- **Reports**: Generate balance reports and low stock alerts
- **Analytics**: Visual analytics with charts and insights
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Integrated with Spring Boot backend API

## 📋 Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:8081` (see backend README)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The API endpoint is configured in `api/config.ts`. By default, it points to:
```typescript
BASE_URL: 'http://localhost:8081'
```

If your backend runs on a different port or URL, update this file.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 🔗 Backend Integration

This frontend is fully integrated with the Spring Boot backend API. Ensure the backend is running before using the application.

### Backend Requirements:
- Backend must be running on `http://localhost:8081`
- MySQL database must be configured and running
- CORS must be enabled (already configured in backend)

### API Endpoints Used:

- **Items**: `/api/items` (GET, POST, PUT, DELETE, PATCH)
- **Transactions**: `/api/transactions` (GET, POST)
- **Reports**: `/api/reports/balance`, `/api/reports/low-stock` (GET)

## 📁 Project Structure

```
Rca-stock-management/
├── api/                    # API integration layer
│   ├── config.ts          # API configuration
│   ├── client.ts          # HTTP client utilities
│   ├── types.ts           # TypeScript types matching backend DTOs
│   └── services/          # API service functions
│       ├── itemService.ts
│       ├── transactionService.ts
│       └── reportService.ts
├── components/            # React components
│   ├── DashboardStats.tsx
│   ├── DashboardCharts.tsx
│   ├── StockCard.tsx
│   ├── TransactionsTable.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useItems.ts        # Items management hook
│   ├── useTransactions.ts # Transactions management hook
│   └── useReports.ts      # Reports management hook
├── utils/                 # Utility functions
│   └── mappers.ts         # Data transformation utilities
├── types.ts               # Frontend type definitions
├── App.tsx                # Main application component
└── index.tsx              # Application entry point
```

## 🎨 Features Overview

### Dashboard
- Real-time inventory statistics
- Visual charts showing stock trends
- Recent inventory activity
- Quick access to key functions

### Stock Management
- View all inventory items with status indicators
- Add new items to inventory
- View item details
- Filter and search items

### Transactions
- View complete transaction history
- Record stock IN movements
- Record stock OUT movements
- Filter by date range and item

### Reports
- Balance report showing all items
- Low stock alerts
- Export functionality (CSV/PDF)

### Analytics
- Visual analytics with charts
- Stock health analysis
- AI-powered insights (sample)

## 🔧 Configuration

### API Configuration

Edit `api/config.ts` to change API settings:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081',  // Backend URL
  TIMEOUT: 30000,                      // Request timeout
  // ...
};
```

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8081
```

## 🧪 Testing the Integration

1. **Start Backend**: Ensure Spring Boot backend is running
2. **Start Frontend**: Run `npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Login**: Use the login screen (currently mock authentication)
5. **Test Features**:
   - Add a new item
   - Record a transaction
   - View reports
   - Check analytics

## 🐛 Troubleshooting

### API Connection Errors

**Error**: "Failed to fetch" or "Network Error"
- **Solution**: Ensure backend is running on `http://localhost:8081`
- Check `api/config.ts` has correct BASE_URL
- Verify CORS is enabled in backend

### CORS Errors

**Error**: "CORS policy blocked"
- **Solution**: Backend CORS is already configured
- Ensure backend `CorsConfig.java` allows frontend origin
- Check browser console for specific CORS error

### Items Not Loading

**Error**: Items list is empty or shows error
- **Solution**: 
  - Check backend is running
  - Verify database has items
  - Check browser console for API errors
  - Verify API endpoint in `api/config.ts`

### Build Errors

**Error**: TypeScript or build errors
- **Solution**:
  - Run `npm install` to ensure dependencies are installed
  - Check Node.js version (requires 18+)
  - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 📦 Dependencies

### Main Dependencies
- **React** 19.2.3 - UI library
- **TypeScript** 5.8.2 - Type safety
- **Vite** 6.2.0 - Build tool
- **Recharts** 3.6.0 - Chart library
- **Lucide React** 0.562.0 - Icons
- **React Markdown** 10.1.0 - Markdown rendering

### Development Dependencies
- **@vitejs/plugin-react** - Vite React plugin
- **@types/node** - Node.js type definitions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The `dist/` folder contains the production build. Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Configure GitHub Actions
- **Any static hosting**: Upload `dist/` contents

### Environment Variables for Production

Set environment variables in your hosting platform:
- `VITE_API_BASE_URL`: Your backend API URL

## 📝 Development Notes

### Adding New Features

1. **API Integration**: Add service functions in `api/services/`
2. **Hooks**: Create custom hooks in `hooks/` for data management
3. **Components**: Create reusable components in `components/`
4. **Types**: Update `types.ts` for new data structures

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

## 🔗 Related Documentation

- [Backend README](../ims/README.md) - Backend API documentation
- [Integration Guide](./INTEGRATION.md) - Detailed integration guide
- [API Integration Summary](./API_INTEGRATION_SUMMARY.md) - API integration details

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check API configuration
4. Review integration documentation

## 📄 License

This project is part of the School Inventory Management System.

## 👥 Contributors

- Developed for RCA School Inventory Management
