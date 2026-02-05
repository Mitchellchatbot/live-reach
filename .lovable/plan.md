
# Performance Optimization Plan

## Summary
Reduce loading times by fixing the N+1 query problem, adding code splitting, implementing data caching, and optimizing realtime updates.

---

## Changes Overview

### 1. Fix N+1 Query Problem (Biggest Impact)
**Current**: Fetches messages for each conversation individually (51 queries for 50 conversations)
**Fix**: Batch fetch all messages in a single query, then group by conversation

```text
Before: 1 query (conversations) + N queries (messages) = 51 round trips
After:  1 query (conversations) + 1 query (all messages) = 2 round trips
```

### 2. Add Code Splitting with React.lazy
Split the bundle so pages load on-demand:
- Landing page users don't download Dashboard code
- Dashboard users don't download Admin code

Priority pages to lazy load:
- AdminDashboard, AgentDashboard
- Analytics, TeamMembers, AISupport
- Salesforce, Notifications, Support
- Documentation pages
- WidgetPreview, WidgetEmbed

### 3. Implement React Query Caching
Replace raw `useState` with `useQuery`:
- Cache conversation data (stale for 30 seconds)
- Show cached data instantly while refreshing in background
- Deduplicate concurrent requests

### 4. Optimize Realtime Updates
Instead of refetching everything on each change:
- For new messages: append to existing data
- For conversation updates: patch the specific conversation
- Only full refetch for deletions or complex changes

### 5. Parallel Data Fetching
Use `Promise.all` to fetch properties and conversations simultaneously rather than sequentially.

---

## Technical Implementation

### File: `src/hooks/useConversations.ts`

**Batch message fetching:**
```typescript
// Get all conversation IDs
const conversationIds = convData.map(c => c.id);

// Single query for ALL messages
const { data: allMessages } = await supabase
  .from('messages')
  .select('*')
  .in('conversation_id', conversationIds)
  .order('sequence_number', { ascending: true });

// Group messages by conversation_id in memory
const messagesByConversation = allMessages.reduce((acc, msg) => {
  if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
  acc[msg.conversation_id].push(msg);
  return acc;
}, {});
```

**Optimized realtime handlers:**
```typescript
// Instead of full refetch on message insert
.on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
  const newMessage = payload.new;
  setConversations(prev => prev.map(c => 
    c.id === newMessage.conversation_id 
      ? { ...c, messages: [...c.messages, newMessage] }
      : c
  ));
})
```

### File: `src/App.tsx`

**Lazy loading pages:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load non-critical pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const TeamMembers = lazy(() => import('./pages/TeamMembers'));
// ... more lazy imports

// Wrap routes with Suspense
<Suspense fallback={<PageLoader />}>
  <AppRoutes />
</Suspense>
```

### File: `src/hooks/useConversationsQuery.ts` (New)

**React Query integration:**
```typescript
export const useConversationsQuery = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversationsOptimized,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## Expected Performance Gains

| Optimization | Before | After | Improvement |
|-------------|--------|-------|-------------|
| Message queries | 51 round trips | 2 round trips | ~25x faster |
| Initial bundle | ~500KB all at once | ~150KB initial | ~3x smaller |
| Return visits | Full refetch | Cached + background | Instant display |
| Realtime updates | Full refetch | Incremental patch | ~10x faster |

---

## Implementation Order

1. **Fix N+1 query** - Immediate, biggest impact
2. **Add code splitting** - Quick win, better initial load
3. **Optimize realtime** - Reduces ongoing lag
4. **Add React Query** - Better caching and UX
5. **Parallel fetching** - Minor additional improvement

