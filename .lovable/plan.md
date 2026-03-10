

## Plan: Create a Dedicated Insurance Collection Demo Page

### What
A new standalone page at `/demo/insurance` (or `/demo-insurance`) that showcases the Care Assist widget running a longer, more detailed autoplay script demonstrating insurance information collection, name capture, phone capture, and deeper conversation flow -- matching the screenshot's conversation style.

### Page Design
- Full-screen, clean layout with a centered large widget preview (no mock website background clutter)
- Header with "Care Assist" branding, back link to home, and CTA button
- Left side: annotation callouts highlighting key moments (e.g., "Lead Captured!", "Insurance Verified", "Phone Collected") that appear as the script progresses
- The widget runs a hardcoded multi-step autoplay script showing the full lead collection flow:
  1. Greeting → visitor gives name
  2. AI asks about situation → visitor describes brother's addiction
  3. AI responds empathetically, asks for phone → visitor provides number
  4. AI asks about insurance → visitor shares insurance provider
  5. AI confirms and wraps up
- "Start Your Own Chat" button at the end to switch to interactive mode
- CTA section below: "Ready to capture leads like this?" → Start Free Trial

### Technical Steps

1. **Create `src/pages/DemoInsurance.tsx`**
   - Standalone page with the `ChatWidget` component
   - Hardcoded `autoPlayScript` array with ~6-8 messages covering name, situation, phone, and insurance collection
   - Uses `demoOverlay` and `onStartOwnChat` props like `LPDemoWidget`
   - Annotation badges that highlight key collection moments (name captured, phone captured, insurance captured) using timed state updates synced to the script

2. **Register route in `src/App.tsx`**
   - Add lazy import for `DemoInsurance`
   - Add route at `/demo/insurance`

### Autoplay Script Content
Based on the uploaded screenshot's conversation style:
```
Visitor: "Hi, my name is Sarah"
AI: "Hi Sarah! I'm here to help. Are you looking for treatment options for yourself or a loved one?"
Visitor: "For my brother. He's struggling with addiction."
AI: "I'm so glad you reached out. That takes courage. We have programs that can help. What's the best number to reach you?"
Visitor: "555-123-4567"
AI: "Got it! Do you happen to know what insurance he has? You can share the name or even a photo of the card."
Visitor: "He has Blue Cross Blue Shield"
AI: "Perfect, we accept BCBS. Someone from our team will call you shortly to walk through next steps."
```

