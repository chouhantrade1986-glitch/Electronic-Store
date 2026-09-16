# Phase 32: ElectroMart Protect Implementation Plan

## Goal
Add an ElectroMart Protect / ElectroMart Care protection ecosystem without changing existing product, renewed, exchange, GST, cart, checkout, or invoice behavior for customers who do not select a plan.

## Scope

### 1. Protection catalog and eligibility
- Add a small, explicit protection-plan catalog in `warranty.js` with stable plan IDs, prices, coverage labels, SAC code, and GST rate.
- Use a shared eligibility function for laptops, smartphones, and audio devices. Hide the PDP widget for all other categories.
- Keep coverage metadata separate from product metadata so protection plans cannot be mistaken for physical goods or inventory.

### 2. PDP add-on widget
- Add an accessible `#protectionPlanWidget` beside the buy box with mutually exclusive `none`, `extended_warranty`, and `damage_protection` options.
- Show the plan price, one-year coverage, screen/liquid exclusions or inclusions, cashless repair promise, and ElectroMart Care branding.
- Persist the selected plan in `electromart_protection_selection_v1` keyed by product ID and emit a `protection:updated` event.
- Add the selected plan to cart only through a structured `protectionPlan` object; do not alter the product price.

### 3. Cart and checkout
- Render a separate protection line beneath its parent device with plan name, price, SAC, and `18% GST` metadata.
- Recalculate subtotal, tax, discount, shipping, and grand total immediately when the plan is selected or removed.
- Preserve product quantity and renewed/exchange metadata independently from protection metadata.
- Ensure cart cleanup removes orphaned plans when the parent product is removed.

### 4. Invoice and order persistence
- Persist selected plans in offline/API order items using `protectionPlan` and `parentProductId` fields.
- Render plans as separate invoice rows with a protection SAC code and 18% GST, including CGST/SGST or IGST according to the existing invoice state.
- Do not apply product HSN or product GST rate to a protection service line.

### 5. Warranty and claims hub
- Add `warranty.html`, `warranty.css`, and `warranty.js` with coverage comparison, cashless service promise, pickup/drop details, original-parts guarantee, FAQ, and claim entry.
- Implement a three-step claim wizard: order verification, device/plan selection, and issue details plus confirmation.
- Generate collision-resistant display IDs in the `EM-CLM-XXXXX` format and persist claims in `electromart_protection_claims_v1`.
- Validate that the selected order contains the selected protection plan before creating a claim.

### 6. Orders, account, and discovery
- Add warranty-certificate and claim-protection actions only for orders containing an active protection plan.
- Add the warranty hub to header navigation, account quick tiles, and sitemap.
- Keep all visible customer-facing branding limited to ElectroMart Protect / ElectroMart Care.

### 7. i18n and legal safety
- Add protection, warranty, claim, coverage, and plan-selection keys to all 11 language dictionaries.
- Run the existing brand-safety guardrail against all new files and ensure no prohibited customer-visible brand references are introduced.

## Test strategy
- Add `scratch/test-amazon-device-warranty.js` as the 64th frontend suite covering:
  1. warranty hub DOM and plan catalog;
  2. eligibility and PDP widget states;
  3. selection persistence and removal;
  4. cart/checkout totals and 18% service GST;
  5. invoice SAC and tax rows;
  6. claim validation and `EM-CLM-XXXXX` generation;
  7. orders/account/navigation, 11 languages, and brand safety.
- Run `node scratch/run_all_tests.js` before and after edits.
- Run `cd backend && npm run test:unit` before and after edits.
- Final target: 64 frontend suites + 74 backend tests = 138/138 passing.

## Delivery sequence
1. Add the plan catalog, eligibility helper, warranty hub, and focused test.
2. Run the focused warranty suite and repair only that slice.
3. Integrate PDP selection and cart/checkout metadata.
4. Integrate invoice, order persistence, orders/account links, and translations.
5. Run all frontend and backend tests, then update `PROJECT_STATUS.md`.
