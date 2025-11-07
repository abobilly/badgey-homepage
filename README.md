# Badgey Homepage

## Using Colors
- **Shared tokens**: The homepage consumes the same semantic tokens as the app shell (`--background`, `--foreground`, `--card`, `--primary`, `--accent`, `--border`, etc.) so gradients, cards, and typography stay in sync. Always resolve colors with `hsl(var(--token))`.
- **Alpha layers**: Hero glows, glass cards, shadows, and overlays lean on the alpha tokens declared in `index.html` (`--overlay-surface`, `--sidebar-active-bg`, `--card-glass-bg`, `--card-glass-border`, `--shadow-base-α`, …). Reuse these instead of appending `/NN` opacity values.
- **Surfaces & copy**: Body/hero backgrounds use `--background` + `--accent`; cards reuse `--card` + `--card-glass-*` for structure, CTA buttons use `--primary` / `--primary-foreground`, and supportive copy sticks with `--muted-foreground`.
- **Focus & overlays**: Any interactive CTA or link needs the shared focus ring (`hsl(var(--focus-ring-α))`). Modal-like overlays must reference `--overlay-backdrop` to keep parity with the app experience.
- **Charts/data viz**: If the marketing page ever surfaces stats, borrow the application `--chart-1…5` tokens to keep visual language identical and color-blind safe.

## Do / Don't
- **Do** inherit the app's design tokens verbatim so the marketing shell and the product never drift.
- **Do** keep hero/CTA contrasts at AA or better (current configuration: CTA 6.2:1, body copy 9+:1 in both themes).
- **Do** document any new surface or blur requirement inside `index.html` next to the token block before using it.
- **Don't** introduce bespoke hex codes, rgba strings, or inline opacity modifiers.
- **Don't** override token values per component; adjust the shared definitions if contrast changes are required.

## Token Guard
- This repo shares the same guard as the frontend. Run `npm run tokens:check` (which calls `scripts/check-tokens.mjs`) to scan `badgey-homepage/index.html` plus the frontend codebase.
- Guard failures indicate hex/rgb/hsla literals, `bg-black/NN`/`bg-white/NN`, arbitrary utilities with literal colors, or inline `hsl(var(--token)/NN)` usage. Replace them with the semantic or alpha tokens defined at the top of `index.html`.
- In CI add `npm run tokens:check` before deployment (`npm run tokens:check && npm run deploy`) so marketing stays aligned with the application palette.
