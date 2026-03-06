

## Admin Portal Enhancement Plan

The existing `/admin` page has basic stats and a client table. Here's the plan to make it a comprehensive monitoring portal.

### What We'll Build

**Enhanced Client Overview Table** — expand each client row to show:
- Total conversations (already there)
- Phone numbers captured (count visitors with non-null `phone` per client's properties)
- Leads collected (count visitors with non-null `name` OR `email` OR `phone`)
- Agent complaints (count from `agent_complaints` table per client)

**Client Detail Drill-Down** — clicking a client row expands or navigates to a detail view showing:
- Their properties list with per-property conversation counts
- Recent conversations with visitor info
- Their agents and statuses
- Any open agent complaints

**New "Complaints" Tab** — a dedicated tab showing all `agent_complaints` across the platform, with status filters (open/resolved) and the ability to update status.

**Platform Stats Enhancement** — add cards for:
- Total phone numbers captured
- Total leads (visitors with contact info)
- Open complaints count

### Technical Approach

1. **No database changes needed** — all data already exists in `visitors`, `agent_complaints`, `conversations`, `properties`, and `agents` tables. The admin role already has RLS access to profiles and user_roles. However, we need to verify admin can read `visitors`, `conversations`, `properties`, `agents`, and `agent_complaints`.

2. **RLS gap**: The admin currently can only read `profiles` and `user_roles` via `has_role()` policies. Tables like `visitors`, `conversations`, `properties`, `agents`, and `agent_complaints` don't have admin SELECT policies — we'll need to add them.

3. **Database migration** — add admin SELECT policies to:
   - `properties` — "Admins can view all properties"
   - `conversations` — "Admins can view all conversations"  
   - `visitors` — "Admins can view all visitors"
   - `agents` — already has admin policy
   - `agent_complaints` — "Admins can view all complaints" + "Admins can update complaints"

4. **Frontend** — rebuild `AdminDashboard.tsx` with:
   - Enhanced stat cards (add phones captured, leads, complaints)
   - Richer client table with the new columns
   - New "Complaints" tab pulling from `agent_complaints`
   - Expandable client rows or a detail dialog

### Implementation Steps

1. Run migration to add admin RLS policies on `properties`, `conversations`, `visitors`, `agent_complaints`
2. Update `AdminDashboard.tsx`:
   - Fetch visitor data to compute phone/lead counts per client
   - Fetch `agent_complaints` for the complaints tab
   - Add new stat cards
   - Add complaints tab with status management
   - Enhance client overview table columns

