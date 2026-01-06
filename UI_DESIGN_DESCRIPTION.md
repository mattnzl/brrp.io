# Waste Jobs UI Design - Visual Description

## Page Layout

The redesigned Waste Jobs page follows the Carbon Credits List style with a modern, professional appearance.

### Color Scheme
- **Background**: Blue gradient (from #1e3a8a to #1e40af)
- **Text**: White with various opacity levels
- **Accents**: Gold/Amber (#fbbf24, #f59e0b) for highlights and CTAs
- **Cards**: Semi-transparent white with blur effect (glassmorphism)
- **Status Colors**:
  - Pending Approval: Blue (#60a5fa)
  - Approved: Green (#10b981)
  - Rejected: Red (#ef4444)

### Header Section
```
┌─────────────────────────────────────────────────────────────────────┐
│ BRRP.IO                                    John Doe                 │
│ Waste Jobs Management - Aliminary         System Admin              │
│                                            [Home] [Admin] [Logout]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Page Header with Breadcrumb
```
┌─────────────────────────────────────────────────────────────────────┐
│ Home / Waste Jobs                    [+ New Waste Job] [Export]     │
└─────────────────────────────────────────────────────────────────────┘
```

### Create Form (When Expanded)
```
┌─────────────────────────────────────────────────────────────────────┐
│ Create New Waste Job                                                │
│                                                                     │
│ Customer *                    Waste Stream *                        │
│ [Waste Management NZ ▼]       [Cow Shed Waste - $210/tonne ▼]     │
│                                                                     │
│ Truck Registration *          Weight (tonnes) *                     │
│ [ABC123            ]          [25.5            ]                   │
│                                                                     │
│ Estimated Price: $5,355.00 (excl GST)                             │
│                                                                     │
│ Notes (optional)                                                    │
│ [                                                              ]    │
│                                                                     │
│                                          [Cancel] [Create Job]      │
└─────────────────────────────────────────────────────────────────────┘
```

### Summary Cards
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Jobs   │ │ Pending      │ │ Approved     │ │ Rejected     │
│              │ │ Approval     │ │              │ │              │
│     156      │ │     42       │ │     98       │ │     16       │
│              │ │   (blue)     │ │   (green)    │ │    (red)     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Tab Navigation
```
┌─────────────────────────────────────────────────────────────────────┐
│ [All (156)] [Pending Approval (42)] [Approved (98)] [Rejected (16)]│
│ ═══════                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Table
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ☐  JOB ID            CUSTOMER    WASTE STREAM  TRUCK   WEIGHT  PRICE     STATUS        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐  WJ-170453-ABC12   WMNZ       Cow Shed      ABC123  25.50t  $5,355   [Pending]     │
│ ☐  WJ-170454-DEF34   EnviroNZ   Food Waste    DEF456  18.20t  $3,822   [Approved]    │
│ ☐  WJ-170455-GHI56   WMNZ       Green Waste   GHI789  32.10t  $6,741   [Rejected]    │
│                                                                                         │
│ ... more rows ...                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

Full table columns:
1. Checkbox (☐)
2. Job ID (gold color, bold)
3. Customer
4. Waste Stream
5. Truck Registration
6. Weight (tonnes)
7. Total Price ($)
8. Status (colored chip)
9. Marketplace Status (gray chip - "Not Listed")
10. Created Date
11. Actions (dropdown)

### Status Chips Examples
- **Pending Approval**: Blue rounded rectangle with light blue background
- **Approved**: Green rounded rectangle with light green background
- **Rejected**: Red rounded rectangle with light red background

### Pagination Footer
```
┌─────────────────────────────────────────────────────────────────────┐
│ Showing 1 to 10 of 156 entries                                      │
│                                                                     │
│         Rows per page: [10 ▼]  [Previous] Page 1 of 16 [Next]     │
└─────────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 768px)
- Full table with all columns visible
- Multi-column form layout
- Side-by-side header elements

### Mobile (< 768px)
- Single column layout
- Scrollable table
- Stacked form fields
- Stacked header elements

## Interactive Elements

### Buttons
- **Primary (Gold)**: Create Job, Submit actions
- **Secondary (Purple)**: Admin, Home navigation
- **Tertiary (White outline)**: Export, Cancel
- **Danger (Red)**: Logout

### Hover Effects
- Table rows highlight on hover
- Buttons lift slightly (translateY -2px)
- Slight opacity changes on navigation items

### Loading States
- "Loading waste jobs..." text in empty table
- Disabled buttons show opacity: 0.5

### Error States
- Red banner at top with error message
- Red border on invalid form fields
- Inline validation messages

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast colors (WCAG AA compliant)
- Focus indicators on all interactive elements

## Key UI Improvements Over Previous Version

1. **Professional Table Layout**: Replaced card-based layout with data table
2. **Advanced Filtering**: Tab-based filtering instead of basic overview
3. **Summary Dashboard**: Quick stats at a glance
4. **Better Status Visualization**: Chips instead of text
5. **Pagination**: Handle large datasets efficiently
6. **Bulk Selection**: Checkboxes for future bulk actions
7. **Breadcrumb Navigation**: Better UX for navigation
8. **Inline Actions**: Dropdown menu for status changes
9. **Collapsible Create Form**: Doesn't take up space when not in use
10. **Consistent Styling**: Matches Carbon Credits List design

## Future Enhancements (Prepared)

- Export functionality (button ready)
- Bulk actions (checkboxes ready)
- Marketplace status tracking (column ready)
- Search functionality (space available)
- Date range filtering (can add to header)
- Sorting by columns (table headers ready)
