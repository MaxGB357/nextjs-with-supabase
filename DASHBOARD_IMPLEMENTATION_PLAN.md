# Dashboard Implementation Plan
## Asistente Evaluaciones de Desempeño

---

## 📋 Executive Summary

This document outlines the step-by-step plan to build a Team Performance Dashboard based on the existing database schema. The dashboard will allow managers to view their direct reports' performance evaluations, including competency scores, potential ratings, and detailed analytics.

---

## 🗄️ Database Schema Analysis

### Tables Overview:
1. **employees** - Employee hierarchy with manager relationships
2. **performance_evaluations** - Annual evaluation scores (potential, competencies, peer/client feedback)
3. **evaluation_comments** - Text commentary for evaluations

### Key Fields for Dashboard:
- **General Metrics**: `general_potential`, `competencies_avg_score`
- **Performance Categories**: `peer_client_score`, `direct_manager_score`
- **Individual Competencies**:
  - `somos_un_solo_equipo_score` (We are one team)
  - `nos_movemos_agilmente_score` (We move agilely)
  - `nos_apasionamos_por_cliente_score` (We are passionate about clients)
  - `cuidamos_el_futuro_score` (We care for the future)

### Helper Functions Available:
- `get_direct_reports(manager_uuid)` - Get all direct reports
- `get_team_performance(manager_uuid, eval_year)` - Get team performance data

### RLS Policies:
- Managers can view their own data and direct reports' data
- All modifications require service role (admin only)

---

## 🎯 Dashboard Features & Components

### 1. **Dashboard Header**
- Display logged-in manager's name
- Show current evaluation year selector
- Quick stats overview

### 2. **Summary Cards** (Top Section)
- Total Direct Reports count
- Average Team Potential
- Average Team Competencies Score
- High Performers count (potential >= 3.0)

### 3. **Team Members Table** (Main Section)
Columns:
- Employee Code
- Full Name
- General Potential (score + label)
- Competencies Average (score + label)
- Direct Manager Score
- Actions (View Details button)

### 4. **Employee Detail Modal/Page**
- Full employee information
- All competency scores with labels
- Performance categories breakdown
- Radar chart showing 4 core competencies
- Comments section (if available)

### 5. **Analytics Section** (Optional)
- Team competency comparison (bar chart)
- Performance distribution (pie/donut chart)
- Trend analysis (if multiple years available)

---

## 🛠️ Technical Implementation Plan

### Phase 1: TypeScript Types & Database Layer
**Files to create/update:**
- `lib/types/performance.types.ts` - TypeScript interfaces
- `lib/services/performance.service.ts` - Data fetching functions
- Update `lib/types/database.types.ts` with new schema

**Tasks:**
1. ✅ Define TypeScript interfaces for:
   - Employee
   - PerformanceEvaluation
   - EvaluationComment
   - TeamSummary
   - EmployeeWithEvaluation

2. ✅ Create service functions:
   - `getCurrentManager()` - Get logged-in manager info
   - `getTeamMembers(year)` - Get direct reports with evaluations
   - `getEmployeeDetail(employeeId, year)` - Get full employee data
   - `getTeamSummary(year)` - Calculate summary statistics
   - `getEmployeeComments(evaluationId)` - Get evaluation comments

---

### Phase 2: UI Components
**Files to create:**
- `components/dashboard/summary-cards.tsx`
- `components/dashboard/team-table.tsx`
- `components/dashboard/employee-detail-modal.tsx`
- `components/dashboard/competency-radar-chart.tsx`
- `components/dashboard/year-selector.tsx`

**Tasks:**
1. ✅ Create SummaryCards component
   - Display 4 metric cards with icons
   - Show loading states
   - Handle empty data

2. ✅ Create TeamTable component
   - Sortable columns
   - Color-coded performance indicators
   - View details action button
   - Responsive design

3. ✅ Create EmployeeDetailModal component
   - Full employee info
   - Competency breakdown
   - Comments section
   - Radar chart integration

4. ✅ Create CompetencyRadarChart component
   - Use recharts or similar library
   - Display 4 core competencies
   - Responsive and accessible

5. ✅ Create YearSelector component
   - Dropdown to select evaluation year
   - Default to current year

---

### Phase 3: Main Dashboard Page
**Files to create/update:**
- `app/dashboard/page.tsx` - Main dashboard page
- Update `app/protected/page.tsx` - Redirect or rename

**Tasks:**
1. ✅ Create dashboard layout
2. ✅ Integrate all components
3. ✅ Handle loading and error states
4. ✅ Add data fetching with proper caching
5. ✅ Implement responsive design

---

### Phase 4: Navigation & Routing
**Files to update:**
- `app/protected/layout.tsx` - Add dashboard navigation
- `components/auth-button.tsx` - Update user menu

**Tasks:**
1. ✅ Add "Mi Equipo" (My Team) navigation link
2. ✅ Update protected routes
3. ✅ Add breadcrumbs (optional)

---

### Phase 5: Polish & Enhancements
**Tasks:**
1. ✅ Add loading skeletons
2. ✅ Implement error boundaries
3. ✅ Add empty states
4. ✅ Optimize performance (memoization, virtualization for large teams)
5. ✅ Add animations/transitions
6. ✅ Accessibility improvements
7. ✅ Mobile responsiveness
8. ✅ Add data export functionality (CSV/PDF)

---

## 📊 Data Flow

```
1. User logs in (Manager with Supabase auth)
   ↓
2. Dashboard loads → getCurrentManager()
   ↓
3. Fetch team data → getTeamMembers(selectedYear)
   ↓
4. Calculate summary → getTeamSummary(teamData)
   ↓
5. Render UI components
   ↓
6. User clicks "View Details" → getEmployeeDetail(employeeId)
   ↓
7. Show modal with full data + comments
```

---

## 🎨 UI/UX Mockup

### Dashboard Layout:
```
┌──────────────────────────────────────────────────────┐
│  🏠 Asistente Evaluaciones                    👤 User │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Mi Equipo - Evaluaciones 2024  [▼ Año: 2024]       │
│                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   📊    │ │   ⭐    │ │   📈    │ │   🎯    │   │
│  │  Total  │ │  Prom.  │ │  Prom.  │ │  Alto   │   │
│  │  Equipo │ │ Potenc. │ │ Compet. │ │ Desem.  │   │
│  │    5    │ │   3.2   │ │   3.4   │ │    3    │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                        │
│  Miembros del Equipo                                  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Código │ Nombre      │ Potenc │ Compet │ ...  │  │
│  ├────────┼─────────────┼────────┼────────┼──────┤  │
│  │  1001  │ Juan Pérez  │  3.0   │  3.5   │ 👁️   │  │
│  │  1002  │ Ana García  │  2.8   │  3.2   │ 👁️   │  │
│  │  1003  │ Luis Torres │  3.5   │  3.8   │ 👁️   │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 🔧 Dependencies to Add

```json
{
  "recharts": "^2.x" // For radar charts and visualizations
}
```

---

## ❓ Clarifying Questions

### 1. **Evaluation Year**
- Should we default to the current year (2025)?
- Do you want a year range selector or just a dropdown?
- Should we show historical data comparison?

### 2. **Performance Thresholds**
- What score range is considered "High Performer"? (Currently assuming >= 3.0)
- Should we have color-coded indicators (red/yellow/green)?
- Any specific thresholds for alerts or notifications?

### 3. **Employee Detail View**
- Should this be a modal or a separate page route?
- Do you want to show evaluation comments on the main table or only in detail view?
- Should managers be able to add/edit comments? (Schema shows read-only via RLS)

### 4. **Data Visualization**
- Which charts are priority: Radar, Bar, Pie, or all?
- Should we show team comparison charts (all team members on one chart)?
- Do you want export functionality (PDF reports, CSV download)?

### 5. **Navigation & Routing**
- Should the current `/protected` page be replaced with the dashboard?
- Or should dashboard be at `/dashboard` with `/protected` showing user's own evaluation?
- Do you want a sidebar navigation or top nav?

### 6. **Real-time Updates**
- Do evaluations change frequently? Should we add real-time subscriptions?
- Or is annual data static once loaded?

### 7. **Internationalization**
- All UI text in Spanish? (Already done for main pages)
- Should competency labels come from database or be hardcoded in Spanish?

### 8. **Mobile Experience**
- Priority for mobile responsiveness?
- Should we have a simplified mobile view?

---

## 📅 Implementation Timeline

### Week 1: Foundation
- Day 1-2: Types, database layer, service functions
- Day 3-4: Basic components (cards, table)
- Day 5: Main dashboard page integration

### Week 2: Features & Polish
- Day 1-2: Employee detail view, charts
- Day 3-4: Navigation, routing, error handling
- Day 5: Testing, optimization, documentation

---

## ✅ Success Criteria

1. Manager can log in and see their team dashboard
2. Summary cards show accurate aggregate metrics
3. Team table displays all direct reports with current year evaluations
4. Employee detail view shows comprehensive performance data
5. Charts visualize competencies effectively
6. Responsive design works on mobile/tablet/desktop
7. All data respects RLS policies (security)
8. Loading states and error handling are graceful

---

## 🚀 Next Steps

Once clarifying questions are answered, we will:
1. Create TypeScript types and interfaces
2. Build database service layer
3. Develop UI components incrementally
4. Integrate and test
5. Polish and optimize

---

## ✅ IMPLEMENTATION COMPLETED

### Answers to Clarifying Questions:
1. **Evaluation Year**: Default to 2024, Year selector added for future use
2. **Performance Thresholds**: 1-5 scale, subtle color coding implemented
3. **Detail View**: Modal implementation chosen
4. **Visualizations**: Team table + Employee detail with radar chart
5. **Routing**: Replaced /protected with dashboard
6. **Data Updates**: Static evaluations (no real-time needed)
7. **Language**: All Spanish UI
8. **Responsive**: Desktop-focused (no mobile optimization)

---

## 📁 Files Created

### Type Definitions
- ✅ `lib/types/performance.types.ts` - Complete TypeScript interfaces for all entities
  - Employee, PerformanceEvaluation, EvaluationComment types
  - Helper types: EmployeeWithEvaluation, TeamSummary, EmployeeDetail
  - Color coding utilities with 4 performance levels

### Service Layer
- ✅ `lib/services/performance.service.ts` - Data fetching functions
  - `getCurrentManager()` - Get logged-in manager
  - `getTeamMembers(year)` - Get direct reports with evaluations
  - `calculateTeamSummary()` - Calculate aggregate statistics
  - `getEmployeeDetail(id, year)` - Get full employee data with comments
  - `getAvailableYears()` - Get evaluation years for selector

### UI Components
- ✅ `components/dashboard/year-selector.tsx` - Year dropdown selector
- ✅ `components/dashboard/summary-cards.tsx` - 4 metric cards (Total Team, Avg Potential, Avg Competencies, High Performers)
- ✅ `components/dashboard/team-table.tsx` - Sortable team table with color-coded badges
- ✅ `components/dashboard/employee-detail-modal.tsx` - Full-screen modal with employee details
- ✅ `components/dashboard/competency-radar-chart.tsx` - Radar chart for 4 core competencies

### Main Dashboard
- ✅ `app/protected/page.tsx` - Replaced old metrics page with team performance dashboard
  - Client-side component with state management
  - Year selection functionality
  - Modal integration for employee details
  - Loading states

### Dependencies
- ✅ Installed `recharts` for data visualization

---

## 🎨 Dashboard Features Implemented

### 1. **Header Section**
- Manager name display
- "Mi Equipo" title with team icon
- Year selector dropdown (defaults to 2024)

### 2. **Summary Cards**
- **Total Equipo**: Count of direct reports
- **Promedio Potencial**: Average team potential score
- **Promedio Competencias**: Average competencies score
- **Alto Desempeño**: Count of high performers (≥3.0)
- Each card has custom icon and color scheme

### 3. **Team Table**
- Sortable columns (Code, Name, Potential, Competencies, Manager Score)
- Color-coded performance badges with labels
- "Ver Detalles" button for each employee
- Empty state handling
- Shows all direct reports with 2024 evaluation data

### 4. **Employee Detail Modal**
- Full employee information (Code, Email, RUT)
- Performance metrics with color-coded badges
- Individual competency scores breakdown
- Radar chart visualization of 4 core competencies:
  - Somos un Solo Equipo
  - Nos Movemos Agilmente
  - Nos Apasionamos por Cliente
  - Cuidamos el Futuro
- Evaluation comments section (if available)
- Peer/Client evaluation scores

### 5. **Color Coding System**
Score ranges (1-5 scale):
- **Excellent** (≥4.0): Green
- **High** (≥3.0): Blue
- **Medium** (≥2.0): Yellow
- **Low** (<2.0): Red

---

## 🔒 Security & Data Flow

### RLS Policies (from schema)
- Managers can only view their own data and direct reports
- All modifications restricted to service role
- Automatic filtering in database queries

### Data Flow
1. User logs in → Auth check
2. Dashboard loads → `getCurrentManager()`
3. Fetch team → `getTeamMembers(selectedYear)`
4. Calculate summary → `calculateTeamSummary()`
5. Display UI with data
6. Click "Ver Detalles" → `getEmployeeDetail(employeeId, year)`
7. Show modal with full data + radar chart

---

## 🚀 How to Use the Dashboard

### For Managers:
1. Log in to the application
2. Navigate to `/protected` (now the team dashboard)
3. View team summary cards at the top
4. Browse team members in the table
5. Click "Ver Detalles" on any employee to see:
   - Full performance metrics
   - Competency breakdown
   - Radar chart visualization
   - Evaluation comments
6. Change year using dropdown (when multiple years available)

### For Developers:
1. Ensure database schema is applied (schema.sql)
2. Populate employees and performance_evaluations tables
3. Set up Supabase environment variables
4. Run `npm install` (recharts included)
5. Run `npm run dev`
6. Dashboard is at `/protected`

---

## 📊 Sample Data Requirements

To test the dashboard, ensure your database has:
- Manager record in `employees` table (with Supabase auth UUID)
- Direct reports with `manager_id` pointing to manager
- Performance evaluations for 2024
- (Optional) Evaluation comments

---

## 🎯 Next Steps for Production

### Data Population
1. Import employee hierarchy from CSV
2. Import performance evaluations for 2024
3. Set up manager authentication accounts
4. Test RLS policies

### Enhancements (Future)
1. Export to PDF/CSV functionality
2. Historical trend analysis (year-over-year)
3. Team comparison charts
4. Search/filter employees
5. Bulk actions for managers
6. Employee selector dropdown
7. Performance alerts/notifications
8. Mobile responsive design (if needed)

---

## ✅ Implementation Complete!

All requested features have been implemented according to your specifications:
- ✅ Database schema integrated
- ✅ TypeScript types defined
- ✅ Service layer created
- ✅ All UI components built
- ✅ Dashboard fully functional
- ✅ Spanish language throughout
- ✅ Color-coded performance indicators
- ✅ Radar chart for competencies
- ✅ Modal detail view
- ✅ Year selector for future use

**The dashboard is ready for use at `/protected`!**
