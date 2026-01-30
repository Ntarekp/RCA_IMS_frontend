# RCA Inventory Management System (Frontend)

This is the frontend application for the RCA Inventory Management System, built with React, TypeScript, and Vite.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

-   `src/api`: API services and configuration for backend communication.
-   `src/components`: Reusable UI components.
-   `src/hooks`: Custom React hooks for data fetching and state management.
-   `src/utils`: Utility functions and helpers.
-   `src/types.ts`: TypeScript type definitions.

## Backend Integration

The frontend is configured to communicate with a Spring Boot backend running on `http://localhost:8081`.
API configuration can be found in `src/api/config.ts`.
