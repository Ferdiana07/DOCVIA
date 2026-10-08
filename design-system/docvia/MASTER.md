# DOCVIA design-system index

The active product design specification is [`docs/DESIGN.md`](../../docs/DESIGN.md). It overrides every older generated style recommendation.

## Active direction

- Editorial clinical system: warm, calm, precise, and task-led.
- Newsreader Variable for display type; Manrope Variable for product UI.
- Pearl `#F5F2EA`, botanical ink `#10231D`, jade `#197A67`, pale sage `#DFE8DC`, and soft chartreuse `#D7ED83` for primary actions.
- Dark mode uses forest-black `#09120F`, deep green surfaces, light jade `#83CFB6`, and the same chartreuse action accent.
- Open layouts and hairline dividers; avoid card grids, glassmorphism, gradients, and nested panels.
- Public pages use a floating navbar and editorial split layouts.
- Authenticated desktop pages use a 252 px workspace rail.
- Phosphor icons are the target icon family for new and redesigned surfaces.
- Photography is candid, naturally lit, and clinically calm; demo doctors use distinct, consistent fictional portraits from `client/public/images/doctors/`.
- Appointment creation always includes a focused review dialog before the request is sent.

## Implementation sources

- Tokens and responsive system: `client/src/index.css`
- Route and role shell: `client/src/App.jsx`, `client/src/components/Navbar.jsx`
- Shared appointment status: `client/src/constants/appointmentStatus.jsx`
- Visual references: `design-system/docvia/references/`

## Reference renders

- `landing-reference.png`
- `directory-reference.png`
- `dashboard-reference.png`
- `form-reference.png`

References guide composition and hierarchy; they do not override functional data, accessibility, or the requirements traceability in `docs/DESIGN.md`.
