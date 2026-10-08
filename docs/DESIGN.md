# DOCVIA — Product UI/UX System

Version 2.0 · October 2026

DOCVIA is a healthcare appointment platform for patients, doctors, and administrators. Its interface must make the next action, current status, and ownership of care unmistakable.

> **Design promise:** Care, made clear.

This document is the design source of truth. Functional requirements remain in `docs/REQUIRMENT.md`; implementation tokens and component styles live in `client/src/index.css`.

---

## 1. Product principles

1. **Task before decoration.** The most urgent or likely action appears first.
2. **Calm, not sterile.** Warm neutral surfaces and botanical green communicate care without looking corporate.
3. **Evidence over claims.** Show verification, published schedules, status history, and next steps.
4. **One strong focal point.** A screen may have one dominant task; supporting information remains quieter.
5. **Progressive disclosure.** List views summarize. Detail views reveal records, contact data, and actions.
6. **Accessible by default.** Persistent labels, visible focus, text status labels, readable contrast, and 44 px minimum targets are mandatory.

DOCVIA must not resemble a generic admin template. Avoid repeated floating cards, gradients, glassmorphism, oversized icon tiles, excessive pills, decorative charts, and nested containers.

---

## 2. Visual direction

The system combines **editorial warmth** with **clinical precision**:

- Pearl page background: `#F5F2EA`
- Paper surface: `#FFFEFA`
- Botanical ink: `#10231D`
- Jade action/support color: `#197A67`
- Pale sage section color: `#DFE8DC`
- Soft chartreuse primary action: `#D7ED83`
- Terracotta warning: `#9B532F`

Neutral colors carry most of the interface. Chartreuse is reserved for the primary action, never for large decorative backgrounds. Semantic colors always appear with text or an icon.

### Theme behavior

- Light mode uses the pearl and paper surfaces above.
- Dark mode uses forest-black `#09120F`, deep surface `#101D18`, raised surface `#172620`, and primary text `#EEF5F1`.
- Jade becomes `#83CFB6` in dark mode so links, focus states, and supporting actions retain readable contrast.
- Chartreuse remains the single primary-action accent in both themes.
- Theme preference is saved locally and defaults to the operating-system preference on first visit.
- The theme control must show its destination ("Dark mode" or "Light mode"), expose pressed state, and remain available before and after sign-in.
- Dark mode must be verified independently for forms, tables, menus, modals, badges, disabled states, and focus indicators.

### Typography

- **Display and section headings:** Newsreader Variable
- **Interface, labels, and body:** Manrope Variable
- Fonts are self-hosted through `@fontsource-variable`; do not add remote Google Font requests.
- Display headings use sentence case, tight line height, and restrained italics for emphasis.
- Body copy should usually remain between 45 and 70 characters per line.

### Shape and depth

- Default radius: 4–8 px for panels and fields.
- Full pill radius is reserved for buttons, badges, and circular controls.
- Use hairline dividers to establish structure.
- Shadows are subtle and limited to floating navigation, menus, modal layers, and one emphasized surface.
- Icons use Phosphor regular weight. Do not mix icon families within new work.

---

## 3. Layout systems

### Public pages

- A floating, compact top navigation sits above the content.
- Maximum content width follows Bootstrap containers (approximately 1320 px at wide desktop).
- Hero sections use an editorial split: concise copy on one side and a single large image or task surface on the other.
- Sections breathe; desktop vertical spacing is 96–160 px and mobile spacing is 64–96 px.

### Signed-in workspace

- Desktop (`≥992 px`): fixed 252 px dark navigation rail with role-specific destinations.
- Tablet/mobile: the rail becomes a top navbar with a collapsible menu.
- Theme and sign-out actions remain visible in the navigation action area; sign out must not be hidden exclusively inside the account menu.
- Main content uses an open page frame, not a dashboard full of floating cards.
- Page order: heading → urgent/focal task → summary strip → work list/detail.

### Directory

- Search filters form one connected band.
- Desktop results use horizontal comparison rows so specialty, experience, availability, and price can be scanned across a consistent axis.
- Filters remain labeled and reflected in the URL.
- Mobile results stack without horizontal scrolling.

### Forms

- Labels remain visible above fields; placeholders are examples only.
- Related fields are grouped through whitespace and dividers, not nested cards.
- Form controls are at least 44 px tall.
- Validation appears next to the field and at submission level when useful.
- A submit button disables and shows progress during network work.
- Appointment requests use a two-step commit: complete the form, then review the doctor, date, time, location, fee, reason, and attachment before sending.

### Photography

- Use calm, candid clinical photography with natural expressions, soft daylight, and pale sage or warm-neutral environments.
- Doctor portraits are fictional demo identities, cropped consistently from the chest up, and use a quiet clinic background so directory rows remain easy to scan.
- Keep photography purposeful: one dominant image per major section, unique doctor portraits, and no decorative image mosaics.
- Generated images contain no embedded text, logos, or watermarks. Interface copy remains accessible HTML.
- Current local assets live in `client/public/images/`: `care-consultation.webp` and the five portraits under `doctors/`.

---

## 4. Component rules

### Buttons

| Level | Appearance | Use |
|---|---|---|
| Primary | Chartreuse fill, dark text | One main action per region |
| Secondary | Outline | Alternative or navigation action |
| Quiet | Text link | Low-risk tertiary action |
| Destructive | Red/terracotta | Cancel, reject, deactivate |

Button copy begins with a verb: “Find a doctor”, “Save schedule”, “Review request”. Icon-only buttons require an accessible label.

### Status

Appointment statuses use the shared `constants/appointmentStatus.jsx` configuration. Status must include readable text; color alone is insufficient.

- Pending: amber/terracotta
- Approved: green
- Completed: green or teal
- Rejected/cancelled: red or neutral

### Data lists and tables

- Use open rows with dividers for ordinary collections.
- Tables are appropriate only when comparison across columns matters.
- Tables must remain horizontally scrollable on small screens.
- Do not expose internal MongoDB identifiers.

### Feedback states

Every API-backed screen must cover:

- Loading: stable skeleton or centered progress with a meaningful label.
- Empty: what is absent, why it matters, and the next useful action.
- Error: human-readable message and retry when safe.
- Success: what happened, what happens next, and where the user can go.

### Dialogs

- Use a modal only for focused review, confirmation, or small edits.
- Destructive confirmations name the affected object and consequence.
- The safe exit remains visually available while an action is processing.

---

## 5. Requirement traceability

This mapping ensures the interface remains aligned with `REQUIRMENT.md`.

| Requirement | Primary UI | Required UX evidence |
|---|---|---|
| Secure patient registration | `/register`, `/login` | Persistent labels, validation, password guidance, safe patient-only public registration |
| Patient profile and medical information | `/patient/profile` | Editable identity, contact, and medical fields with success/error feedback |
| Browse and filter doctors | `/doctors` | Search, specialty, location, working-day filters, verified-only result copy |
| Doctor profile and live availability | `/doctors/:id` | Qualification, experience, fee, location, published schedule, booking CTA |
| Appointment request | `/patient/book/:doctorId` | Date, available time, reason, optional document, disabled occupied slots, review summary before final submission, immediate pending-state message |
| Appointment management | `/patient/appointments`, detail and reschedule routes | History, current status, cancel/reschedule eligibility, clinical notes |
| Notifications and reminders | role notification routes | Unread state, timestamps, status changes, clear read controls; email/SMS delivery remains a service concern |
| Doctor schedule management | `/doctor/profile` | Editable availability and fee with validation |
| Doctor booking workflow | `/doctor/appointments` | Pending review, approve/reject, completed state, patient context |
| Visit summary and recommendations | doctor appointment workflow and patient appointment detail | Restricted clinical fields, follow-up notes, recommendations, document access |
| Doctor approval | `/admin/doctors` | Pending-first review, approve/reject with explicit consequence |
| User governance | `/admin/users` | Role, account status, joined date, safe account controls |
| Platform oversight | `/admin/appointments`, `/admin/disputes`, `/admin/settings` | Cross-system visibility, support case resolution, booking/reminder/public-notice controls |

Role-based access control is not only visual. Routes and API authorization must continue enforcing it. Public users only see approved doctors; sensitive patient records are limited to the patient, assigned doctor, and authorized administration paths.

---

## 6. Page specifications

### Home

- Lead with “Care, without the runaround.” and one primary doctor-search CTA.
- Show trust evidence immediately after the hero.
- Specialty rows, a three-step booking explanation, privacy proof, and final CTA follow.
- Keep the first laptop viewport focused on proposition, human image, and trust.

### Patient workspace

- Dashboard prioritizes the next appointment.
- A single divided strip summarizes all, pending, approved, and completed visits.
- Subsequent appointments appear as a chronological list.
- Appointment detail owns reschedule, cancellation, documents, and completed visit notes.

### Doctor workspace

- Dashboard prioritizes the next confirmed patient and pending requests.
- Appointment management exposes only status-valid actions:
  - pending → approve or reject;
  - approved → complete;
  - completed → read and maintain visit documentation as allowed.
- Patient phone, email, and documents belong in appointment detail—not overview lists.

### Admin workspace

- Dashboard leads with a combined attention queue.
- Pending doctor verification and open support cases receive priority over passive totals.
- User, appointment, settings, dispute, and verification tools use consistent list/table states.

---

## 7. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| `<480 px` | One-column content, stacked actions, compact type, two-column summary strip, no horizontal page overflow |
| `480–767 px` | Stacked directory rows and dashboard sections |
| `768–991 px` | Two-column where meaningful; signed-in navigation remains collapsible topbar |
| `≥992 px` | Signed-in sidebar rail; public split layouts; horizontal comparison rows |

Touch targets are at least 44 × 44 px. Content must work at 320 px minimum width and at 200% browser zoom. Do not remove information on mobile; reorder or progressively disclose it.

---

## 8. Accessibility and safety

- Page structure uses one `h1` and sequential section headings.
- Every form control has a unique `id` and connected label.
- Keyboard focus is visible and never suppressed.
- Skip navigation targets `#main-content`.
- Images use useful alternative text; decorative images use empty `alt`.
- Reduced-motion preferences disable nonessential animation.
- Never use animation to communicate a clinical or appointment state.
- Patient contact details and uploaded documents never appear in public interfaces.
- Error copy never exposes stack traces, database errors, tokens, or internal IDs.

---

## 9. Implementation guardrails

- Stack: React 19, Vite 8, React Router, React-Bootstrap, Axios, vanilla CSS.
- Reuse `services/api.js`, `useAuth()`, protected routes, and shared status configuration.
- New icons come from `@phosphor-icons/react`.
- Do not introduce another component framework.
- Use native date utilities already present in the project.
- Preserve query parameters for searchable/filterable views.
- Prefer CSS classes over one-off inline styling.
- Visual references are stored in `design-system/docvia/references/`; they guide composition, not literal product content.

---

## 10. Definition of done

A DOCVIA screen is complete only when:

- it satisfies its mapped functional requirement;
- hierarchy exposes the main task within the first viewport;
- desktop, tablet, and mobile layouts do not overflow;
- loading, empty, error, and success states are intentional;
- controls are keyboard accessible and at least 44 px tall;
- status is understandable without relying on color;
- sensitive data appears only in authorized detail contexts;
- text is human-readable and gives a next step;
- lint and production build pass;
- the result visually belongs to this editorial clinical system.

**One-line identity:** DOCVIA is warm editorial healthcare, precise task hierarchy, and quiet operational confidence.
