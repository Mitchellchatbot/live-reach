
# Notify on Phone Number Detection

## Overview
Add a new notification trigger -- "Phone Number Submitted" -- to both Slack and Email notification settings. When the `extract-visitor-info` function detects a phone number for the first time, it will fire notifications to the configured channels.

## Changes

### 1. Database Migration
Add a `notify_on_phone_submission` boolean column (default `true`) to both notification settings tables:
- `slack_notification_settings` 
- `email_notification_settings`

### 2. UI Updates

**SlackSettings.tsx** and **EmailSettings.tsx**:
- Add a new "Phone Number Submitted" toggle under the existing Notification Triggers card
- Description: "Notify when a visitor shares their phone number"
- Include it in the config interface and save logic

### 3. Edge Function: `extract-visitor-info`
After successfully updating a visitor's phone number (line ~172-174), fire non-blocking calls to `send-email-notification` and `send-slack-notification` with a new event type `phone_submission`. Pass the visitor name, phone, and conversation ID.

### 4. Edge Function: `send-email-notification`
- Add `phone_submission` to the `eventType` union type
- Add a check for `settings.notify_on_phone_submission`
- Build a phone-specific email template (e.g., green "Phone Number Captured" banner with visitor name and phone)

### 5. Edge Function: `send-slack-notification`
- Add `phone_submission` to the `eventType` union type
- Add a check for `settings.notify_on_phone_submission`
- Build a Slack message block for phone capture (e.g., "Phone Number Captured" header with visitor/phone fields)

### 6. Notification Log
The existing `notification_logs` table should already capture these since the edge functions log activity there. The new `phone_submission` event type will appear naturally in the Logs tab.

## Technical Details

- The `extract-visitor-info` function needs the `conversationId` to pass to notification functions. It currently receives `visitorId` and `conversationHistory`. We will look up the active conversation for that visitor to get the `conversationId` and `propertyId`.
- Both notification functions already support fire-and-forget patterns, so no changes to the calling pattern are needed.
- The new column defaults to `true` so existing properties get phone notifications automatically.
