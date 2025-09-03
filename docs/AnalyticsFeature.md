# Analytics Tab Feature Implementation Plan

This document outlines the incremental plan for building the Analytics tab using existing hooks and components. Each component gets its own phase for focused development.

## General Guidelines:

- **Data Source**: Use existing `useDashboardData` and `useNetWorthHistory` hooks
- **Component Structure**: All analytics components go into `@components/analytics/`
- **Navigation**: Index page has links to individual analytics, not everything loaded at once
- **Reuse**: Leverage existing dashboard chart component (`IntegratedDashboard_Wagmi.tsx`)
- **Styling**: Use existing theming system via `useTheme` hook

---

## Phase 1: Analytics Index Page with Navigation

- [ ] **1.1 Update Types in `types/supabase.ts`**:
  - Ask user for sample output of both the edge functions to update the types in `types/supabase.ts` and hooks 'useDashboardData' and 'useNetWorthHistory'
  - Add interfaces for analytics data based on existing edge function responses:

  ```typescript
  // Analytics interfaces based on actual data structure
  interface CategoryBreakdown {
    category: string;
    assets: number;
    liabilities: number;
    total: number;
  }

  interface CurrencyExposure {
    currency: string;
    assets: number;
    liabilities: number;
    total: number;
  }

  interface TopAccount {
    account_id: string;
    name: string;
    type: 'asset' | 'liability';
    category: string;
    currency: string;
    amount: number;
  }

  interface PerformanceSummary {
    start: number;
    end: number;
    change: number;
    percent: number;
  }

  interface MonthlyDelta {
    month: string;
    delta: number;
    percent: number;
  }

  interface GrowthStreak {
    current_streak: number;
    longest_streak: number;
  }
  ```

- [ ] **1.2 Create Analytics Index Structure**:
  - Create `app/(tabs)/analytics/index.tsx` with navigation cards
  - Add header with "Analytics" title
  - Create simple navigation cards (no data loading on index page)

- [ ] **1.3 Add Navigation Routes**:
  - Create `components/analytics/` folder for all analytics components
  - Setup routes for each analytics view: `/analytics/performance`, `/analytics/trends`, etc.
  - Add proper loading states and error handling to index

---

## Phase 2: Performance Summary Screen

- [ ] **2.1 Create Performance Route**:
  - Create `app/(tabs)/analytics/performance.tsx`
  - Use existing `useNetWorthHistory` hook
  - Add period selector from existing dashboard component

- [ ] **2.2 Create PerformanceCard Component**:
  - Create `components/analytics/PerformanceCard.tsx`
  - Display start/end values, change amount, percentage
  - Use `historyData.insights.performanceSummary` data
  - Add period selector similar to dashboard
  - Add back navigation to analytics index

---

## Phase 3: Growth Trends Screen with Chart

- [ ] **3.1 Create Growth Trends Route**:
  - Create `app/(tabs)/analytics/trends.tsx`
  - Reuse existing `IntegratedDashboard_Wagmi` component logic
  - Adapt chart styling for analytics context

- [ ] **3.2 Create GrowthStreakCard Component**:
  - Create `components/analytics/GrowthStreakCard.tsx`
  - Use `historyData.insights.growthStreak` data
  - Display current and longest streak with visual indicators
  - Add to trends screen below the chart

---

## Phase 4: Monthly Changes Chart

- [ ] **4.1 Install Chart Dependencies**:
  - Add `react-native-chart-kit` and `react-native-svg` or 'react-native-wagmi-charts' which is already present. use which is best suited

- [ ] **4.2 Create Monthly Changes Route**:
  - Create `app/(tabs)/analytics/monthly-changes.tsx`
  - Create `components/analytics/MonthlyChangeChart.tsx`
  - Use `historyData.insights.monthlyDeltas` data
  - Implement bar chart with green/red colors

---

## Phase 5: Category Breakdown Screen

- [ ] **5.1 Install Pie Chart Dependency**:
  - Add `react-native-pie-chart`

- [ ] **5.2 Create Category Breakdown Route**:
  - Create `app/(tabs)/analytics/categories.tsx`
  - Create `components/analytics/CategoryBreakdownChart.tsx`
  - Use `snapshotData.analytics.categoryBreakdown` from `useDashboardData`
  - Implement donut chart with category legend

---

## Phase 6: Top Accounts Screen

- [ ] **6.1 Create Top Accounts Route**:
  - Create `app/(tabs)/analytics/top-accounts.tsx`
  - Create `components/analytics/TopAccountsList.tsx`
  - Use `snapshotData.analytics.topAccounts` data
  - Add tap navigation to individual account details
  - Show account rankings and percentage of total net worth

---

## Phase 7: Achievements/Badges Screen

- [ ] **7.1 Create Achievements Route**:
  - Create `app/(tabs)/analytics/achievements.tsx`
  - Create `components/analytics/BadgesSection.tsx`
  - Combine `snapshotData.analytics.badges` and `historyData.badges`
  - Display badges with descriptions and unlock dates

---

## Phase 8: Currency Exposure Screen (Optional)

- [ ] **8.1 Create Currency Exposure Route**:
  - Create `app/(tabs)/analytics/currency.tsx`
  - Create `components/analytics/CurrencyExposureChart.tsx`
  - Use `snapshotData.analytics.currencyExposure` data
  - Implement horizontal bar chart

---

## Phase 9: Final Polish & Navigation

- [ ] **9.1 Add Smooth Transitions**:
  - Implement navigation animations between screens
  - Add shared element transitions for charts

- [ ] **9.2 Add Pull-to-Refresh**:
  - Implement refresh functionality across all analytics screens
  - Add haptic feedback for interactions

- [ ] **9.3 Performance Optimization**:
  - Add `React.memo` to all components
  - Implement proper loading skeletons
  - Add error boundaries for robust error handling

---

## File Structure

```
app/(tabs)/analytics/
├── index.tsx                    # Main analytics hub
├── performance.tsx              # Performance summary
├── trends.tsx                  # Growth trends with chart
├── monthly-changes.tsx         # Monthly changes chart
├── categories.tsx              # Category breakdown
├── top-accounts.tsx           # Top accounts list
├── achievements.tsx           # Badges and achievements
└── currency.tsx               # Currency exposure (optional)

components/analytics/
├── PerformanceCard.tsx
├── GrowthStreakCard.tsx
├── MonthlyChangeChart.tsx
├── CategoryBreakdownChart.tsx
├── TopAccountsList.tsx
├── BadgesSection.tsx
└── CurrencyExposureChart.tsx
```

## Data Source Reference

**Hooks already available:**

- `useDashboardData()` → provides `analytics.categoryBreakdown`, `analytics.topAccounts`, `analytics.badges`
- `useNetWorthHistory({period})` → provides `insights.performanceSummary`, `insights.monthlyDeltas`, `insights.growthStreak`, `badge`

**Existing component to reuse:**

- `IntegratedDashboard_Wagmi.tsx` → for growth trends chart

**Navigation Cards Explanation:**

- Each card on the analytics index shows:
- Icon and title (e.g., "Performance Summary")
- Brief description (e.g., "Track your net worth growth")
- Arrow indicating it's clickable
- No actual data loading - just navigation

**No backend changes required** - all data already available in current edge functions.
