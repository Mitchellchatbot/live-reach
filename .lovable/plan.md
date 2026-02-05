
# Make Greeting Static and Clean Up Data

## Summary
Convert the greeting from a database-stored message to a static UI element, then clean up all the accumulated greeting-only data.

---

## Part 1: Database Cleanup

### Step 1: Delete Greeting Messages
Delete all messages that match common greeting patterns:

```sql
DELETE FROM messages 
WHERE sender_id = 'ai-bot' 
  AND sender_type = 'agent' 
  AND sequence_number = 1
  AND (
    content = 'Hi there! How can we help today?'
    OR content = 'Hi there! 👋 How can I help you today?'
    OR content ILIKE 'Hi there!%How can%help%today%'
  );
```

Estimated: ~1,125+ rows

### Step 2: Delete Empty Conversations
Delete conversations that now have 0 messages (greeting-only conversations):

```sql
DELETE FROM conversations 
WHERE id IN (
  SELECT c.id FROM conversations c
  LEFT JOIN messages m ON m.conversation_id = c.id
  GROUP BY c.id
  HAVING COUNT(m.id) = 0
);
```

### Step 3: Delete Orphaned Visitors
Delete visitors that have no remaining conversations:

```sql
DELETE FROM visitors 
WHERE id NOT IN (
  SELECT DISTINCT visitor_id FROM conversations
);
```

---

## Part 2: Code Changes

### File: `supabase/functions/widget-bootstrap/index.ts`

**Remove the greeting insertion logic (lines 142-160):**

Currently inserts greeting as first message - this entire block will be removed:
```typescript
// REMOVE THIS ENTIRE SECTION:
const greetingText = (greeting ?? property.greeting ?? "").toString();
if (greetingText.trim()) {
  const { data: anyMsg } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .limit(1);

  if (!anyMsg || anyMsg.length === 0) {
    await supabase.from("messages").insert({...});
  }
}
```

Also update the response to include the greeting text for the widget to display:
```typescript
return new Response(JSON.stringify({ 
  visitorId, 
  conversationId, 
  visitorInfo,
  greeting: property.greeting // Pass greeting for static display
}), {...});
```

### File: `src/hooks/useWidgetChat.ts`

**Add greeting to state and display it as static UI:**

1. Store greeting from bootstrap response:
```typescript
const [greetingText, setGreetingText] = useState<string>('');
```

2. In `ensureWidgetIds`, save the greeting from response:
```typescript
if (data?.greeting) {
  setGreetingText(data.greeting);
}
```

3. Return `greetingText` from the hook for the widget to use

### File: `src/components/widget/ChatWidget.tsx`

**Display greeting as static header element:**

Instead of showing greeting in the messages list, display it as a static welcome banner:

```typescript
// Get greetingText from useWidgetChat hook
const { messages, greetingText, ... } = useWidgetChat({...});

// In the messages area, show greeting as a static element before messages
{greetingText && (
  <div className="flex gap-3 mb-4">
    <div className="h-9 w-9 flex items-center justify-center">
      <MessageCircle className="h-4 w-4 text-white" />
    </div>
    <div className="max-w-[75%] bg-card border border-border/30 px-4 py-3 rounded-lg">
      <span className="text-xs text-muted-foreground mb-1">{displayName}</span>
      <p className="text-sm">{greetingText}</p>
    </div>
  </div>
)}

{/* Then render actual messages (visitor messages + AI responses) */}
{messages.map((msg) => ...)}
```

### File: `src/hooks/useWidgetChat.ts` (Additional Changes)

**Don't create conversation until visitor sends first message:**

Currently, `widget-bootstrap` creates a conversation immediately. Change this so:
1. Bootstrap only creates/finds the visitor, not the conversation
2. Conversation is created only when visitor sends their first message
3. This prevents empty conversations from being stored

This requires modifying `ensureWidgetIds` to optionally skip conversation creation, and updating `sendMessage` to create the conversation on-demand.

---

## Part 3: Prevent Future Empty Data

### Lazy Conversation Creation Flow

```
Before (Current):
Widget Opens -> Bootstrap creates Visitor + Conversation + Greeting Message

After (New):
Widget Opens -> Bootstrap creates Visitor only
Visitor Types -> Create Conversation + Save Message
```

**Benefits:**
- No more greeting messages stored
- No empty conversations cluttering the database  
- Conversations only exist when there's real visitor engagement
- Dashboard only shows meaningful conversations

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/widget-bootstrap/index.ts` | Remove greeting insertion, return greeting text |
| `src/hooks/useWidgetChat.ts` | Store greeting in state, lazy conversation creation |
| `src/components/widget/ChatWidget.tsx` | Display greeting as static UI element |

---

## Data Impact

| Before | After |
|--------|-------|
| 1,125+ greeting messages | 0 greeting messages |
| Many empty conversations | Only engaged conversations |
| Orphaned visitors | Clean visitor data |
