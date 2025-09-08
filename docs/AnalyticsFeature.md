# Analytics Tab Feature Implementation Plan

This document outlines the incremental plan for building the Analytics tab using existing hooks and components. Each component gets its own phase for focused development.

## General Guidelines:

- **Data Source**: Use existing `useDashboardData` and `useNetWorthHistory` hooks
- **Component Structure**: All analytics components go into `@components/analytics/`
- **Navigation**: Index page has links to individual analytics, not everything loaded at once
- **Reuse**: Leverage existing dashboard chart component (`IntegratedDashboard_Wagmi.tsx`)
- **Styling**: Use existing theming system via `useTheme` hook

---

# Analytics Tab Feature Implementation Plan - FINAL

This document outlines the comprehensive plan for building 6 focused Analytics sections using existing hooks and data sources. Based on UX research and user behavior analysis, we've optimized the structure for maximum user value while minimizing cognitive load.

## **Final Analytics Structure Decision (6 Sections)**

After analyzing user needs and financial app best practices, we determined that Category Breakdown deserves its own section rather than being combined with Achievements. This provides:

- **Clear Mental Models**: Each section answers a distinct user question
- **Reduced Cognitive Overload**: No forced groupings of unrelated features
- **Better Data Utilization**: Each data source gets focused presentation
- **User-Centric Design**: Aligns with how users think about their finances

---

### **Existing Hooks:**

- `useDashboardData()` → `analytics.categoryBreakdown`, `analytics.topAccounts`, `analytics.badges`, `analytics.currencyExposure`
- `useNetWorthHistory({period})` → `insights.performanceSummary`, `insights.monthlyDeltas`, `insights.growthStreak`, `insights.volatility`, `insights.extremes`, `insights.trend`, `insights.highs`

### **Database Functions:**

- `get_accounts_with_balances()` → Account overview data
- `get_net_worth_history()` → Historical data with account-level breakdown
- Individual account history via filtered account data

### **Existing Components to Reuse:**

- `IntegratedDashboard_Wagmi.tsx` → Wagmi charts with period selectors
- Theme system via `useTheme` hook
- Haptic feedback via `useHaptics` hook

---

## Phase 1: Analytics Index Page with Navigation

### **Updated Navigation Structure (6 Sections):**

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

---

## **Phase 2: Performance Overview Screen (Priority 1)**

**Consolidates:** Performance Summary + Growth Trends

### **2.1 Create Performance Route**

- [ ] Create `app/(tabs)/analytics/performance.tsx`
- [ ] **Hero Chart**: Reuse `IntegratedDashboard_Wagmi` component with enhanced styling
- [ ] **Key Metrics Grid**: 4-metric layout (Total Return, Monthly Avg, Best Month, Volatility)
- [ ] **Growth Insights**: AI-generated insights from performance data
- [ ] **Growth Streak Display**: Current and longest streak indicators

### **2.2 Components to Create:**

- [ ] `components/analytics/PerformanceMetricsGrid.tsx` - 2x2 grid of key metrics
- [ ] `components/analytics/PerformanceInsights.tsx` - AI-generated insights component

### **2.3 Data Sources:**

- **Chart**: `useNetWorthHistory({period})` - reuse existing logic
- **Metrics**:
  - Total Return: `historyData.insights.performanceSummary.percent`
  - Monthly Average: Calculate from `insights.monthlyDeltas`
  - Best Month: `insights.extremes.biggestGain`
  - Volatility: `insights.volatility.stddevPercent`
- **Insights**:
  - Growth Streak: `insights.growthStreak.current_streak`
  - All-time High: `insights.highs.isAtAllTimeHigh`
  - Trend Direction: `insights.trend.direction`

---

## **Phase 3: Monthly Changes Screen (Priority 2)**

**Enhanced granular month-by-month analysis**

### **3.1 Create Monthly Changes Route**

- [ ] Create `app/(tabs)/analytics/monthly-changes.tsx`
- [ ] **Monthly Heatmap**: Visual calendar showing performance colors
- [ ] **Performance Table**: Detailed month-by-month breakdown with values
- [ ] **Extremes Highlight**: Biggest gain/drop months prominently displayed
- [ ] **Contribution Analysis**: New money vs. growth differentiation

### **3.2 Components to Create:**

- [ ] `components/analytics/MonthlyHeatmap.tsx` - Calendar-style performance view
- [ ] `components/analytics/MonthlyPerformanceTable.tsx` - Detailed month list
- [ ] `components/analytics/MonthlyInsights.tsx` - "Your best month was..." insights

### **3.3 Data Sources:**

- **Monthly Data**: `historyData.insights.monthlyDeltas[]`
- **Extremes**: `insights.extremes.biggestGain` and `insights.extremes.biggestDrop`
- **Consistency Patterns**: Analyze `monthlyDeltas` for streaks and patterns

---

## **Phase 4: Account Analysis Screen (Priority 1 - High Engagement)**

**Individual account drill-down with interactive charts**

### **4.1 Create Account Analysis Route**

- [ ] Create `app/(tabs)/analytics/accounts.tsx`
- [ ] **Accounts Overview**: Top performing accounts list with rankings
- [ ] **Drill-down Modal**: Individual account Wagmi charts on tap
- [ ] **Account Comparison**: Performance vs. category averages
- [ ] **Account Performance Attribution**: Which accounts drive overall growth

### **4.2 Components to Create:**

- [ ] `components/analytics/AccountPerformanceList.tsx` - Ranked account list
- [ ] `components/analytics/AccountComparisonChart.tsx` - Account vs category performance
- [ ] `components/analytics/AccountInsights.tsx`
### **4.3 New Hook Needed:**

- [ ] Create `hooks/useAccountHistory.ts` - Individual account historical data
  - Filters `get_net_worth_history()` results by account_id
  - Returns Wagmi-compatible chart data for single accounts

### **4.4 Data Sources:**

- **Overview**: `dashboardData.analytics.topAccounts`
- **Individual Charts**: Filtered account data from `get_net_worth_history()`
- **Categories**: `dashboardData.analytics.categoryBreakdown` for comparison
- **Account Performance**: Calculate growth rates per account

---

## **Phase 5: Category Breakdown Screen (Priority 2)**

**Separate focused section for asset allocation analysis**

### **5.1 Create Category Breakdown Route**

- [ ] Create `app/(tabs)/analytics/categories.tsx`
- [ ] **Interactive Pie/Donut Chart**: Category distribution with tap interactions
- [ ] **Category Performance**: Which categories grew/declined
- [ ] **Asset vs Liability Balance**: Visual breakdown
- [ ] **Portfolio Insights**: "Your portfolio is 60% investments, 30% cash..."

### **5.2 Components to Create:**

- [ ] `components/analytics/CategoryBreakdownChart.tsx` - Interactive donut chart
- [ ] `components/analytics/CategoryPerformanceList.tsx` - Category growth rates
- [ ] `components/analytics/AssetLiabilityBalance.tsx` - Assets vs liabilities view
- [ ] `components/analytics/PortfolioInsights.tsx` - Portfolio composition insights

### **5.3 Data Sources:**

- **Categories**: `dashboardData.analytics.categoryBreakdown[]`
- **Performance**: Calculate category-level growth from historical data
- **Balance**: Assets vs liabilities breakdown from category data

---

## **Phase 6: Currency Exposure Screen (Priority 3)**

**Multi-currency portfolio analysis**

### **6.1 Create Currency Exposure Route**

- [ ] Create `app/(tabs)/analytics/currency.tsx`
- [ ] **Currency Breakdown**: Pie chart of currency distribution
- [ ] **Currency Performance**: Performance by currency over time
- [ ] **Exchange Rate Impact**: Analysis of FX effects on portfolio
- [ ] **Currency Risk Insights**: "Your USD exposure is 45%..."

### **6.2 Components to Create:**

- [ ] `components/analytics/CurrencyBreakdownChart.tsx` - Currency distribution pie chart
- [ ] `components/analytics/CurrencyPerformanceAnalysis.tsx` - FX impact analysis
- [ ] `components/analytics/CurrencyRiskInsights.tsx` - Currency diversification insights

### **6.3 Data Sources:**

- **Currency Data**: `dashboardData.analytics.currencyExposure[]`
- **Exchange Rates**: Historical FX impact on portfolio value
- **Risk Analysis**: Currency concentration analysis

---

## **Phase 7: Achievements Screen (Priority 2)**

**Pure gamification and milestone celebration**

### **7.1 Create Achievements Route**

- [ ] Create `app/(tabs)/analytics/achievements.tsx`
- [ ] **Achievement Badges**: Visual badge collection with progress
- [ ] **Milestone Timeline**: Financial milestones reached over time
- [ ] **Progress Tracking**: Goals and targets (future enhancement)
- [ ] **Motivational Insights**: "You've grown consistently for X months..."

### **7.2 Components to Create:**

- [ ] `components/analytics/AchievementBadges.tsx` - Badge collection display
- [ ] `components/analytics/MilestoneTimeline.tsx` - Achievement timeline
- [ ] `components/analytics/ProgressTracking.tsx` - Goal progress (future)
- [ ] `components/analytics/MotivationalInsights.tsx` - Encouraging insights

### **7.3 Data Sources:**

- **Badges**: `dashboardData.analytics.badges` + `historyData.badges`
- **Milestones**:
  - All-time High: `insights.highs.isAtAllTimeHigh`
  - Growth Streaks: `insights.growthStreak`
  - Performance Records: `insights.extremes`

---

## **Phase 8: Enhanced Features & Polish**

### **8.1 Account Drill-down Implementation**

- [ ] **Individual Account Charts**: Reuse Wagmi chart with account filtering
- [ ] **Account Performance Comparison**: Account vs category/overall average
- [ ] **Account Growth Attribution**: What percentage of growth comes from each account
- [ ] **Account Insights**: "Your Savings account grew 15% this year"

### **8.2 Advanced Insights Engine**

- [ ] **Pattern Recognition**: "Your best performing months are typically..."
- [ ] **Trend Analysis**: "Your savings rate is accelerating"
- [ ] **Personalized Recommendations**: Based on user behavior patterns
- [ ] **Contextual Insights**: Reference category and achievements in other sections

### **8.3 Performance Optimization**

- [ ] Lazy loading for heavy chart components
- [ ] Memoization for expensive calculations (monthly deltas, volatility)
- [ ] Smooth navigation transitions between sections
- [ ] Proper loading states and error boundaries

---

## **Updated File Structure**

app/(tabs)/analytics/
├── index.tsx # 6-section navigation hub
├── performance.tsx # Performance Overview (combines old performance + trends)
├── monthly-changes.tsx # Enhanced monthly analysis with heatmap
├── accounts.tsx # Account analysis with drill-down modal
├── categories.tsx # Category breakdown (separate from achievements)
├── currency.tsx # Currency exposure analysis
└── achievements.tsx # Pure gamification and milestones

components/analytics/
├── PerformanceMetricsGrid.tsx # 2x2 performance metrics grid
├── PerformanceInsights.tsx # AI-generated performance insights
├── MonthlyHeatmap.tsx # Calendar-style performance view
├── MonthlyPerformanceTable.tsx # Detailed monthly breakdown table
├── MonthlyInsights.tsx # Monthly analysis insights
├── AccountPerformanceList.tsx # Ranked list of account performance
├── AccountDrillDownModal.tsx # Individual account chart modal
├── AccountComparisonChart.tsx # Account vs category comparison
├── AccountInsights.tsx # Account-specific insights
├── CategoryBreakdownChart.tsx # Interactive category pie/donut chart
├── CategoryPerformanceList.tsx # Category growth analysis
├── AssetLiabilityBalance.tsx # Assets vs liabilities breakdown
├── PortfolioInsights.tsx # Portfolio composition insights
├── CurrencyBreakdownChart.tsx # Currency distribution chart
├── CurrencyPerformanceAnalysis.tsx # FX impact analysis
├── CurrencyRiskInsights.tsx # Currency diversification insights
├── AchievementBadges.tsx # Badge collection display
├── MilestoneTimeline.tsx # Achievement timeline
├── ProgressTracking.tsx # Future: Goal progress tracking
└── MotivationalInsights.tsx # Encouraging milestone insights

hooks/
└── useAccountHistory.ts # New: Individual account historical data

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

---

## **Why This 6-Section Structure Works:**

### **✅ User-Centric Design**

- **Performance Overview**: "How am I doing overall?" (combines trends + summary)
- **Monthly Changes**: "What happened month-by-month?" (detailed granular view)
- **Account Analysis**: "Which specific accounts are performing well?" (drill-down capability)
- **Category Breakdown**: "How is my wealth allocated?" (asset allocation strategy)
- **Currency Exposure**: "What's my currency risk?" (FX analysis)
- **Achievements**: "What milestones have I reached?" (pure gamification)

### **✅ Clear Data Utilization**

- Each section uses distinct data sources effectively
- No overlap or confusion about where to find information
- Rich insights possible within each focused area

### **✅ Scalable Architecture**

- Easy to enhance individual sections without affecting others
- Clean separation of concerns for maintenance
- Future features (goals, benchmarks) fit naturally into structure

### **✅ High User Engagement**

- Account drill-down provides "aha moments"
- Category insights help with financial planning
- Achievements provide motivation to continue tracking
- Monthly analysis satisfies detail-oriented users

---

## **Key Implementation Notes:**

1. **Reuse Existing Components**: Leverage `IntegratedDashboard_Wagmi` for all chart needs
2. **Consistent Styling**: Use existing theme system throughout
3. **Progressive Enhancement**: Start with basic functionality, add advanced features iteratively
4. **Mobile-First**: Ensure all components work well on phone screens
5. **Performance**: Lazy load heavy components and memoize calculations
6. **Accessibility**: Include proper labels and haptic feedback

---

## **Success Metrics:**

- **User Engagement**: Track which sections get most usage
- **Session Duration**: Measure time spent in analytics vs other tabs
- **Feature Discovery**: Monitor if users find and use account drill-down
- **User Retention**: Analytics usage correlation with app retention

This comprehensive plan provides a clear roadmap for building analytics that truly serve user needs while leveraging all available data effectively.

**No backend changes required** - all data already available in current edge functions.
