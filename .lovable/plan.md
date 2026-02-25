
# Beef Up Documentation

## What's Missing

The current documentation (6 sections, ~20 topics) is outdated and doesn't cover many features that have been added. Here's what needs to be added or updated:

## New Sections and Topics to Add

### 1. Getting Started - New Topics
- **Onboarding Flow** - The guided setup wizard for new accounts (choosing AI tone, setting up first property)
- **Dashboard Tour** - The interactive guided tour and deep-dive page tours
- **Workspaces** - Switching between workspaces, workspace management

### 2. Inbox - Updates
- **Conversation Shortcuts** - Chat shortcuts and quick replies available in the chat panel
- **Real-time Updates** - How conversations update live with typing indicators and message streaming
- **Conversation Status** - Active, closed, pending states and how auto-close works for stale conversations

### 3. AI Support - New Topics
- **Service Area / Geo-Filtering** - Global, US Only, and Specific States filters; blocked visitor messages
- **Typo Injection** - The humanization feature that adds natural typos to AI responses
- **Quick Reply After First** - Fast reply mode after the first message
- **Drop Apostrophes** - Casual tone setting
- **AI Tone Presets** - Emily, Michael, Daniel, Sarah personality presets from onboarding

### 4. Widget - Updates
- **Widget Effects** - Visual effects and animation options for the chat widget
- **Widget Preview** - The live preview page for testing widget appearance

### 5. Integrations - New Topics
- **Slack Integration** - Updated to reflect OAuth flow (connect via Slack button, channel selection)
- **Salesforce OAuth** - Updated to reflect the proper OAuth connection flow and field mapping
- **Email Notifications** - Updated to cover notification log and delivery tracking

### 6. New Section: Compliance
- **HIPAA Settings** - Data retention policies, audit logging, session timeouts, BAA requirements
- **Data Purging** - Automatic purge of expired data based on retention settings
- **Audit Log** - Tracking admin actions for compliance

### 7. New Section: Account
- **Subscription & Billing** - Plans, subscription management
- **Account Settings** - Profile, email, password, session management
- **Business Info / Properties** - Managing property details, domains, website info extraction
- **Visitor Leads** - Viewing and managing captured visitor/lead data

### 8. Analytics - Expand
- **Blog Analytics** - Blog/content performance tracking
- **Page Analytics** - Per-page visitor tracking and engagement metrics
- **Conversation Metrics** - AI vs human response rates, resolution times

## Technical Changes

### File: `src/data/documentation.ts`
- Add ~20 new topic entries across existing and new sections
- Add two new sections: "Compliance" and "Account"
- Update existing topic descriptions to reflect current UI and feature set
- Add proper `relatedTopics` cross-links between new and existing topics

### File: `src/pages/Documentation.tsx`
- Add icons for new sections (Shield for Compliance, CreditCard/Settings for Account)
- Update the `sectionIcons` map

### File: `src/components/docs/DocsSidebar.tsx`
- No changes needed (already renders dynamically from data)

### File: `src/pages/docs/DocPage.tsx`
- No changes needed (already renders dynamically from data)

## Summary
- **~20 new documentation topics** added
- **2 new sections** (Compliance, Account)
- **Existing topics updated** where features have changed
- All new topics follow the existing pattern: title, description, whatItDoes, howToUse steps, tips, relatedTopics
