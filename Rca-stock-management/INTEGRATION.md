# Backend Integration Guide

This document explains how to integrate the React frontend with the Java Spring Boot backend.

## Backend API Endpoints

The backend runs on `http://localhost:8081` (configured in `application.properties`).

### Items API (`/api/items`)
- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item
- `PATCH /api/items/{id}/damaged` - Record damaged quantity

### Transactions API (`/api/transactions`)
- `GET /api/transactions` - Get all transactions (optional `?itemId={id}` filter)
- `GET /api/transactions/date-range?startDate={date}&endDate={date}` - Get transactions by date range
- `POST /api/transactions` - Record new transaction (IN or OUT)

### Reports API (`/api/reports`)
- `GET /api/reports/balance` - Get complete stock balance report
- `GET /api/reports/low-stock` - Get low stock items

## Frontend Integration Structure

```
api/
├── config.ts              # API configuration
├── types.ts               # TypeScript types matching backend DTOs
├── client.ts              # HTTP client utilities
├── services/
│   ├── itemService.ts     # Item API calls
│   ├── transactionService.ts  # Transaction API calls
│   └── reportService.ts  # Report API calls
└── index.ts               # Main export file

hooks/
├── useApi.ts              # Generic API hook
├── useItems.ts            # Items management hook
├── useTransactions.ts     # Transactions management hook
└── useReports.ts          # Reports management hook

utils/
└── mappers.ts             # Data transformation utilities
```

## Usage Examples

### 1. Using the API Services Directly

```typescript
import { getAllItems, createItem } from './api';

// Get all items
const items = await getAllItems();

// Create new item
const newItem = await createItem({
  name: 'Rice',
  unit: 'Sacks',
  minimumStock: 10,
  description: 'Thai jasmine rice'
});
```

### 2. Using Custom Hooks

```typescript
import { useItems } from './hooks/useItems';

function MyComponent() {
  const { items, loading, error, addItem } = useItems();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### 3. Updating App.tsx

Replace mock data imports with API hooks:

```typescript
// Before
import { MOCK_STOCK_ITEMS, MOCK_DASHBOARD_DATA } from './constants';

// After
import { useItems } from './hooks/useItems';
import { useReports } from './hooks/useReports';
```

Then use the hooks in your component:

```typescript
const App = () => {
  const { items, loading: itemsLoading, addItem } = useItems();
  const { dashboardItems, loading: reportsLoading } = useReports();
  
  // ... rest of your code
};
```

## Configuration

Update the API base URL in `api/config.ts` if your backend runs on a different port:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081', // Change this if needed
  // ...
};
```

## Error Handling

The API client throws `ApiError` for HTTP errors. Handle them in your components:

```typescript
try {
  await addItem(itemData);
  addToast('Item created successfully!', 'success');
} catch (error) {
  if (error instanceof ApiError) {
    addToast(`Error: ${error.message}`, 'error');
  }
}
```

## Data Mapping

The backend DTOs are automatically mapped to frontend types using `utils/mappers.ts`:

- `ItemDTO` → `StockItem`
- `StockBalanceDTO` → `DashboardItem`
- `StockTransactionDTO` → Transaction format

## Next Steps

1. Update `App.tsx` to use the hooks instead of mock data
2. Update form handlers to call API services
3. Add loading states and error handling
4. Test the integration with your backend running

## Testing the Integration

1. Start the backend server (port 8081)
2. Start the frontend dev server (`npm run dev`)
3. Check browser console for API calls
4. Verify data is loading from the backend

