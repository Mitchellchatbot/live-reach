

## Plan: Create "Meet Samantha" Landing Page

Create a new standalone page at `/meet-samantha` that transforms the LinkedIn post content into a visually compelling landing page with graphics and structured sections.

### New File: `src/pages/MeetSamantha.tsx`

A full-page layout with these sections:

1. **Hero** — "What if your best admissions coordinator never slept?" headline with a large illustration area (a gradient card with a moon/clock icon representing 24/7 availability)
2. **Intro** — "Meet Samantha" with the narrative text about her not being a chatbot, built to sound like your best coordinator
3. **The Shift** — Highlighted callout block: "That single shift — from passive to proactive — changes everything" with the 30-seconds stat
4. **Checklist** — Five green-check bullet points as styled cards/badges (trained on facility language, medical-safe guardrails, crisis detection, collects info, Slack alerts)
5. **Testimonial** — Blockquote from Michael R., CEO, Serenity Treatment with his photo
6. **CTA** — "Your Digital Twin is ready. Is your website?" with a button linking to `care-assist.io` or `/auth`

Graphics will use icon compositions (lucide icons like `Moon`, `ShieldCheck`, `Brain`, `Phone`, `Slack`) inside colored gradient circles, plus accent backgrounds and decorative borders — no external images needed beyond the existing Michael testimonial photo.

### Update: `src/App.tsx`

- Add lazy import for `MeetSamantha`
- Add route: `<Route path="/meet-samantha" element={<MeetSamantha />} />`

