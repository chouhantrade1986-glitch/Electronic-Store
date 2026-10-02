# Quick Testing Guide - Amazon Style UI/UX Improvements

## How to Test the Changes

### 1. Start the Application

```bash
# Option 1: Use the batch file (Windows)
run-all.bat

# Option 2: Start backend and frontend separately
cd backend
npm run dev

# In another terminal
node qa-static-server.js
```

### 2. Pages to Test

Visit these pages to see the Amazon-style improvements:

#### Primary Product Listing Pages:
- **Desktops**: `http://localhost:5500/desktops.html`
- **Laptops**: `http://localhost:5500/laptop.html`
- **Printers**: `http://localhost:5500/printer.html`
- **Best Sellers**: `http://localhost:5500/best-sellers.html`
- **All Products**: `http://localhost:5500/products.html`

### 3. Visual Checklist

#### Product Cards ✓
- [ ] Cards have white background with subtle shadow
- [ ] Images are square (1:1 aspect ratio) with padding
- [ ] Product titles clamp at 2 lines maximum
- [ ] Spec chips display inline (brand, processor, purpose, RAM, storage)
- [ ] Price is prominent in red (#B12704) at 21px
- [ ] Rating shows with star symbol (★) in orange
- [ ] Two buttons: "View Details" (outlined) + "Add to Cart" (amber)
- [ ] Hover effect lifts card slightly with enhanced shadow
- [ ] Image zooms slightly on hover (scale 1.05)

#### Badges ✓
- [ ] Featured products show "Hot" badge (red)
- [ ] B2B products show "B2B" badge
- [ ] Badges positioned top-left corner of card
- [ ] Badge text is uppercase and bold

#### Filter Sidebar ✓
- [ ] White background with gradient header
- [ ] Brand list scrolls if too many items (max-height 280px)
- [ ] Checkboxes have amber accent color when checked
- [ ] Select dropdowns span full width
- [ ] Search bar has amber focus ring
- [ ] All inputs have proper hover/focus states

#### Responsive Behavior ✓

**Desktop (>1024px):**
- [ ] 4-5 product cards per row
- [ ] Filters on left side
- [ ] 18px gap between cards

**Tablet (768px-1024px):**
- [ ] 2-3 product cards per row
- [ ] Filters move above product grid
- [ ] 14px gap between cards

**Mobile (<768px):**
- [ ] 2 product cards per row
- [ ] Filters stack vertically
- [ ] 12px gap between cards
- [ ] Buttons stack vertically on cards

**Small Mobile (<480px):**
- [ ] 2 product cards per row (compact)
- [ ] Single column filters
- [ ] 10px gap between cards
- [ ] Smaller font sizes maintained

### 4. Accessibility Testing

#### Keyboard Navigation ✓
- [ ] Tab through all interactive elements
- [ ] Focus visible on buttons, links, inputs (amber outline)
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in select dropdowns
- [ ] Escape closes any open modals/menus

#### Screen Reader ✓
- [ ] Product names announced properly
- [ ] Prices read correctly
- [ ] Ratings include "out of 5 stars" context
- [ ] Button labels descriptive ("Add [Product Name] to cart")
- [ ] Links have meaningful text

#### Visual Accessibility ✓
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Text readable at all zoom levels
- [ ] Focus indicators clear and visible
- [ ] No content hidden on zoom

### 5. Functional Testing

#### Interactions ✓
- [ ] Clicking product image goes to detail page
- [ ] Clicking title goes to detail page
- [ ] "View Details" button works
- [ ] "Add to Cart" button adds item (check cart count)
- [ ] Brand chip links filter by brand
- [ ] Filter checkboxes update results
- [ ] Sort dropdown changes order
- [ ] Search input filters products

#### Edge Cases ✓
- [ ] Empty state shows when no products match filters
- [ ] Long product names don't break layout
- [ ] Missing images show fallback
- [ ] Zero ratings display as "0.0"
- [ ] B2B products show MOQ info

### 6. Performance Testing

#### Load Time ✓
- [ ] Page loads within 2 seconds
- [ ] Images lazy load (check Network tab)
- [ ] No console errors
- [ ] CSS files load without 404s

#### Smooth Animations ✓
- [ ] Card hover transitions smooth (no jank)
- [ ] No layout shifts during load
- [ ] Scroll performance smooth
- [ ] Filter updates feel instant

### 7. Cross-Browser Testing

Test on multiple browsers:

#### Desktop Browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)

#### Mobile Browsers:
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Samsung Internet

### 8. Common Issues & Fixes

#### Issue: Cards look different on some pages
**Fix**: Clear browser cache (Ctrl+Shift+R) or check CSS version parameter

#### Issue: Filters not working
**Fix**: Check browser console for JavaScript errors

#### Issue: Images stretched or distorted
**Fix**: Verify `object-fit: contain` is applied in amazon-theme.css

#### Issue: Hover effects not working
**Fix**: Check that amazon-theme.css loads before page-specific CSS

#### Issue: Mobile layout broken
**Fix**: Verify viewport meta tag present in HTML head

### 9. Browser DevTools Tips

#### Inspect Product Cards:
```
Right-click card → Inspect Element
Check computed styles for:
- padding, margin, border
- box-shadow values
- transform on hover
- z-index for badges
```

#### Test Responsive Breakpoints:
```
DevTools → Toggle Device Toolbar
Select preset devices or custom dimensions
Test at: 1920px, 1440px, 1024px, 768px, 480px, 375px
```

#### Check Accessibility:
```
DevTools → Lighthouse tab
Run accessibility audit
Aim for score > 90
```

#### Monitor Performance:
```
DevTools → Network tab
Reload page
Check CSS/JS load times
Verify no failed requests
```

### 10. Reporting Issues

If you find problems, note:
1. **Page URL**: Which page has the issue?
2. **Browser**: Which browser and version?
3. **Screen Size**: Desktop, tablet, or mobile?
4. **Expected vs Actual**: What should happen vs what happens?
5. **Screenshot**: Capture the issue if possible
6. **Console Errors**: Any JavaScript errors in console?

### 11. Success Criteria

All tests pass if:
- ✅ Product cards consistent across all listing pages
- ✅ Responsive grid works at all breakpoints
- ✅ All interactive elements accessible via keyboard
- ✅ No visual glitches or layout breaks
- ✅ Performance acceptable (<2s load time)
- ✅ Cross-browser compatibility confirmed
- ✅ Zero console errors
- ✅ Accessibility score > 90 (Lighthouse)

---

## Quick Smoke Test Script

For automated basic testing, run:

```powershell
# Windows PowerShell
.\qa-smoke.ps1

# Or use the batch file
run-smoke-suite.bat
```

This will check:
- Backend API responding
- Frontend serving correctly
- Basic page loads successful
- No critical errors

---

**Testing Time Estimate**: 30-45 minutes for thorough manual testing  
**Automated Tests**: 5-10 minutes  

**Last Updated**: 2026-06-03
