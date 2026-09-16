---
name: frontend-design
description: Industry-standard guidelines and workflows for crafting distinctive, production-grade UI/UX, responsive components, micro-animations, and visual polish in modern Next.js/React applications.
---

# Industry-Standard Frontend UI/UX Design Skill

Use this skill when designing, building, or refactoring user interfaces to deliver distinctive, production-grade visual aesthetics, fluid interactions, and intuitive UX — avoiding generic "AI template" patterns.

---

## 1. Design Philosophy: Anti-Generic & Intentional

1. **Avoid "AI Slop" & Generic Defaults**:
   - Reject plain card grids, default system fonts, and uninspired purple/blue gradients.
   - Craft a distinctive visual identity tailored to the specific product domain (e.g. sleek dark-mode developer tools, high-density dashboard, glassmorphism, or warm modern editorial).

2. **Typography & Spatial Scale**:
   - Establish strict typographic hierarchy: font weights (`font-mono`, `font-sans`, `font-bold`), letter spacing (`tracking-tight`, `tracking-wider`), and monospaced elements for code/URLs/IDs.
   - Use cohesive spatial padding (`px-3 py-1.5`, `gap-2`, `shrink-0`) and explicit container constraints (`max-w-7xl`, `h-full overflow-hidden`).

3. **Color Tokens & Contrast Matrix**:
   - **Base Tones**: Deep charcoal/slate dark modes (`#121212`, `#181818`, `#1e1e1e`, `#242424`).
   - **Borders & Dividers**: Crisp low-contrast borders (`#2b2b2b`, `#333333`, `#383838`).
   - **Accents**: Intentional brand highlight (e.g. Amber `#eab308`/`#facc15` for developer tools, Emerald `#0cbb52` for success, Rose `#f43f5e` for alerts).

---

## 2. Production UX & State Machine Rules

1. **Local Draft State Pattern**:
   - **Never fire API requests on every keypress** inside inputs or modals.
   - Always maintain local component draft state while editing. Persist to backend ONCE on explicit save/close ("Done"). This guarantees **zero focus loss**, **zero typing lag**, and **zero network thrashing**.

2. **Full State Matrix for Components**:
   - Every interactive component must handle all 5 core UI states:
     1. **Default State**: Clean, readable resting UI.
     2. **Hover / Active State**: Subtle scale/color feedback (`hover:bg-[#282828] active:scale-[0.98] transition`).
     3. **Focus State**: Clear keyboard accessibility (`focus:ring-1 focus:ring-[#eab308] outline-none`).
     4. **Loading / Pending State**: Non-shifting pulse skeletons (`animate-pulse bg-[#2a2a2a]`), never layout-jumping spinners.
     5. **Empty / Error State**: Thoughtful empty states with clear iconography and call-to-action.

3. **Layout Isolation & Independent Scroll**:
   - Web apps with sidebars, route editors, or logs MUST enforce `flex flex-col min-h-0 overflow-hidden` on parent layout shells.
   - Main panels and sidebars scroll independently (`overflow-y-auto flex-1 min-h-0`), preventing full page body scrollbars.

---

## 3. Component Crafting Checklist

- [ ] **Design Token Check**: Colors, typography, spacing, and borders use predefined design system tokens.
- [ ] **Fluid Interactions**: All buttons, tabs, and list items have hover/active/focus states.
- [ ] **Input Isolation**: Form inputs operate on local draft state during editing.
- [ ] **Container Constraints**: Table columns, flex items, and headers use `truncate`, `shrink-0`, and `min-w-0` to prevent layout breaking.
- [ ] **A11y & Keyboard Nav**: Escape closes modals, Enter submits forms, ARIA labels on icon-only buttons.
