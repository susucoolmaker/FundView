# Design QA

Reference: user-provided final acceptance image on 2026-07-18.
Prototype: `http://127.0.0.1:4173/?v=1784445617387#/dashboard`
Latest implementation screenshot: `/private/tmp/merchant-dashboard-single-icon-full.png`
Latest comparison evidence: `/private/tmp/merchant-dashboard-icons-compare.png`
Viewport checked: 1096 × 2526 browser viewport.
State: dashboard homepage, top visual card plus restored 最近记录 and bottom navigation.

## Checks

- The dashboard page now renders the approved final design image directly as the static acceptance layer.
- The source image is preserved unmodified in the project as `src/assets/dashboard/merchant-fund-final-design.png`.
- Browser render uses the image's original natural dimensions: 941 × 1672.
- On the current preview viewport, the image is centered and displayed at 941 × 1672, with no stretch or crop.
- The old homepage title and old dashboard entry buttons are hidden for this static UI-confirmation step; bottom navigation is restored.
- Per the latest correction, the original `最近记录` section is restored below the final design image with 5 recent records.
- The `最近记录` card is widened to align with the main card visual width, using 24px side spacing instead of the previous narrower 54px spacing.
- Per the latest interaction request, the dashboard restores the bottom navigation and adds transparent hotspots over `当前保证金`, `本月充值`, and `本月提现`.
- Browser click checks route the hotspots to `#/records/deposit`, `#/records/recharge`, and `#/records/withdraw`.
- The bottom transaction summary strip is replaced by a new-order message card with a message icon and routes to `#/records/sales`.
- Per the 2026-07-19 icon correction, recharge and withdraw no longer render any additional overlay SVG icons. They use only the single icon already present in the approved design image, avoiding double drawing or visual overlap.
- Per the latest icon correction, the message icon no longer has a circular base or extra ball underneath it; it is a standalone line message icon.
- Browser click check confirms the restored bottom navigation's records item routes to `#/records/sales`.
- Browser click checks confirm `当前保证金`, `本月充值`, `本月提现`, and the new-order message card still route to their corresponding detail pages after the icon adjustment.
- Browser preview shows no Vite error overlay and no console error logs.
- Verification completed: `pnpm vitest run src/views/dashboard/DashboardView.spec.ts src/App.spec.ts`, `pnpm exec vue-tsc -b`, and `pnpm exec vite build` all pass. The build warning about `inlineDynamicImports` is existing Vite guidance and does not affect rendering.

## Final result

passed
