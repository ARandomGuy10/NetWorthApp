# Gemini Project Context: NetWorthApp

## Project Overview

This is a cross-platform personal finance application named **PocketrackrApp**, built to track a user's net worth. The application allows users to manage financial accounts (assets and liabilities), track balances over time, and visualize their net worth growth.

The architecture consists of a **React Native (Expo)** frontend and a **Supabase** backend. User authentication is handled by **Clerk**.

## Technology Stack

- **Core Framework**: React Native, Expo (SDK 53), TypeScript
- **Authentication**: Clerk (`@clerk/clerk-expo`)
- **Backend & Database**: Supabase (`@supabase/supabase-js`)
  - **Database**: Supabase Postgres
  - **Security**: Row-Level Security (RLS) enforced by passing Clerk JWTs.
  - **Serverless Logic**: Supabase Edge Functions (Deno) for complex data aggregation.
- **Data Fetching & Server State**: TanStack Query (React Query) is the primary mechanism for managing server state.
- **Client State**: Zustand is used for minimal, global client-side state.
- **Routing**: Expo Router (file-based).
- **Charting & UI**:
  - `react-native-chart-kit` for data visualization.
  - `expo-linear-gradient` for styling.
  - A custom theme system via `src/styles/theme/ThemeContext`.

## Key Architectural Patterns & Data Flow

1.  **Secure Data Flow**: The application follows a robust security model. The Clerk client acquires a JWT, which is then passed as an `Authorization` header in every request to Supabase. This allows Supabase to enforce Row-Level Security policies, ensuring users can only access their own data.

2.  **Data Fetching with TanStack Query**: All interactions with the Supabase backend are encapsulated within custom hooks in the `hooks/` directory.
    -   `useQuery` is used for reading data (e.g., `useAccounts`).
    -   `useMutation` is used for CUD (Create, Update, Delete) operations.
    -   On successful mutations, `queryClient.invalidateQueries` is called to refetch dependent data and keep the UI consistent.

3.  **Optimized Backend Queries**: The app uses Supabase Edge Functions to offload complex computations from the client. For example, the main dashboard data, including currency conversions and net worth calculations, is prepared by an edge function, reducing client-side logic and improving performance.

4.  **File-based Routing**: Navigation is managed by Expo Router. The `app/` directory defines the routes, with groups for different application states:
    -   `(auth)`: Contains all pre-authentication screens (Welcome, Sign In, Sign Up).
    -   `(tabs)`: Contains the main, post-authentication screens (Dashboard, Accounts, etc.).

## Building and Running

The project uses `npm` as the package manager. Key commands are defined in `package.json`:

-   **Start development server**:
    ```bash
    npm start
    ```
    (or `expo start`)

-   **Run on iOS**:
    ```bash
    npm run ios
    ```

-   **Run on Android**:
    ```bash
    npm run android
    ```

-   **Run on Web**:
    ```bash
    npm run web
    ```

## Development Conventions

-   **Data Fetching**: Always use or create a custom hook in `hooks/` for any backend interaction. Do not call Supabase directly from components.
-   **State Management**:
    -   Use TanStack Query for all data that comes from the server.
    -   Use Zustand (`stores/`) only for ephemeral, global client-side state that is not tied to the server (e.g., UI state).
-   **Environment Variables**: The project requires environment variables for Clerk and Supabase credentials (e.g., `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPABASE_URL`). Ensure these are present in a `.env` file.
-   **Styling**: Use the `useTheme` hook for all styling to ensure consistency.
-   **Types**: Adhere to the strict TypeScript configuration. Utilize the auto-generated Supabase types from `lib/supabase.ts` for all database-related objects.
