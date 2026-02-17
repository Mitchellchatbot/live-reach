

## Prompt Tuning: Nurture Longer + Remove "Brave/Courage" Language

Two targeted changes to the immutable base prompt in `supabase/functions/chat-ai/index.ts`:

### 1. Nurture the conversation before asking for contact info

Update the **ENGAGEMENT STRATEGY** section to explicitly instruct the AI to have at least 3-4 back-and-forth exchanges before attempting to collect name/phone. The AI should focus on listening, understanding what they're going through, and building rapport first.

### 2. Ban "brave/courage" language, use simpler empathy

Add a rule under **TONE and VOICE** that explicitly forbids phrases like "that's so brave," "it takes courage," "you're brave for reaching out," or any variation. Instead, the AI should use grounded, simple empathy like "I'm sorry you're going through that," "that sounds really tough," "I hear you" -- with natural variance, never repeating the same phrase back-to-back.

---

### Technical Details

**File:** `supabase/functions/chat-ai/index.ts`

**Change 1 -- TONE and VOICE section (around line 110):** Add a new bullet:
```
- NEVER use phrases like "that's brave," "it takes courage," "you're so brave," or any variation. Instead, use grounded empathy: "I'm sorry you're dealing with that," "that sounds really tough," "I hear you." Vary your phrasing naturally, never repeat the same empathy line twice in a row.
```

**Change 2 -- ENGAGEMENT STRATEGY section (around line 126):** Add before the existing bullets:
```
- Build Rapport First: Have at least 3-4 natural exchanges before asking for any contact information. Listen to what they're going through, ask follow-up questions, and let them feel heard before transitioning to lead capture.
```

**Change 3 -- LEAD CAPTURE section (around line 154-155):** Update the instruction to reinforce the delay:
```
After you have had at least 3-4 meaningful exchanges and the visitor feels heard, begin naturally collecting their contact information.
```

After editing, the edge function will be redeployed automatically.

