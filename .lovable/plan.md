

## Plan: Add Chatbot User Manual to Documentation

The existing documentation system in `src/data/documentation.ts` already covers most product features but lacks a dedicated section that serves as an end-user manual for the chatbot widget itself — i.e., content aimed at helping **your clients** (treatment centers) understand how to set up, configure, and get the most out of their chatbot.

I'll reorganize and expand the documentation by adding a new **"Chatbot User Manual"** section that consolidates and extends the chatbot-specific guidance into a practical, step-by-step manual. This section will cover the full lifecycle: setup, AI configuration, lead capture, humanization, crisis handling, integrations, and going live.

### New Section: `chatbot-manual` (9 topics)

**1. Getting Your Chatbot Live** — End-to-end checklist from property creation to embedding the widget on your site.

**2. Writing Your AI Base Prompt** — How to craft effective instructions: what to include (services, FAQs, tone, boundaries), examples, and iteration tips.

**3. Configuring Lead Capture** — Upfront forms vs. natural capture, which fields to require, insurance card photo uploads, and balancing conversion vs. friction.

**4. Humanizing AI Responses** — Typo injection, apostrophe dropping, response delays, typing indicators, quick-reply-after-first — making the bot feel like a real person.

**5. Escalation & Crisis Detection** — Setting up escalation keywords, message limits, what happens when the bot escalates, and how crisis/suicidal ideation keywords trigger immediate alerts.

**6. Proactive Engagement** — Configuring proactive messages, timing strategies, and geo-filtering to target the right visitors.

**7. Managing Conversations** — Inbox workflow: active/closed tabs, shortcuts, real-time updates, visitor info panel, and agent handoff.

**8. Connecting Notifications** — Setting up Slack, email, and Salesforce so your team never misses a lead — with auto-export triggers and field mappings.

**9. Measuring Performance** — Using analytics to track AI resolution rate, response times, page engagement, and conversation metrics to continuously improve.

### Implementation

- Add the new `chatbot-manual` section to the `documentationSections` array in `src/data/documentation.ts` (inserted near the top, after "Getting Started")
- Add a `BookOpenCheck` icon mapping in `src/pages/Documentation.tsx` for the new section
- All topics will include `relatedTopics` cross-linking to existing docs for deeper dives
- No new components or routes needed — the existing `DocsLayout`, `DocsSidebar`, and `DocPage` handle everything automatically

