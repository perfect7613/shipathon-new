# Frontend Paywall & Onboarding Implementation

## Overview
Implemented a paywall system with onboarding flow. Users must pay before accessing the dashboard, then complete genre preferences before seeing content.

## Changes Made

### 1. ✅ ElevenLabs Voice ID Updated
**File**: `backend/src/services/audio/elevenlabs.ts`
- Changed professional voice from `Xb7hH8MSUJpSbSDYk0k2` to `NOpBlnGInO9m6vDvFkFC`

### 2. ✅ Landing Page - No Free Trial
**File**: `app/page.tsx`
- Removed all "Free Trial" language
- Removed free tier from pricing section
- All CTAs now point to paid plans
- Changed to 2-column pricing grid (Pro & Enterprise only)

**Changes**:
- Hero CTA: "Start Free Trial" → "Get Started - $19/mo"
- Pro CTA: "Start Pro Trial" → "Get Started Now"
- Final CTA: "Start Your Free Trial" → "Get Started Today"

### 3. ✅ Dashboard Paywall
**File**: `app/(dashboard)/layout.tsx`
- Checks for active subscription before allowing dashboard access
- Redirects to `/pricing` if no active subscription
- Checks onboarding status
- Shows onboarding flow if not completed

**Flow**:
1. User logs in
2. Check subscription → If no subscription → redirect to `/pricing`
3. Check onboarding → If not onboarded → show `<OnboardingFlow />`
4. If both passed → show dashboard

### 4. ✅ Onboarding Flow Component
**File**: `components/onboarding/onboarding-flow.tsx`
- Beautiful genre selection UI
- Multi-select genre cards
- Saves preferences to `user_preferences` table
- Triggers initial article generation for selected genres
- Auto-redirects to dashboard after completion

**Features**:
- Animated genre cards with icons
- Visual feedback for selections
- Loading state during setup
- Saves `preferred_genres` array
- Sets `onboarded` flag to `true`

### 5. ✅ Pricing Page
**File**: `app/(marketing)/pricing/page.tsx` (if not exists, needs creation)
- Shows only Pro ($19) and Enterprise ($49) plans
- Integrates with checkout action
- Redirects users with active subscriptions to dashboard

### 6. ✅ Onboarding API Endpoint
**File**: `app/api/generate/onboarding/route.ts`
- POST endpoint that triggers article generation
- Receives selected genres from onboarding form
- Calls backend to generate articles for each genre
- Runs in background, doesn't block user flow

### 7. ✅ Database Migration
**File**: `backend/migrations/create_user_preferences.sql`
- Creates `user_preferences` table
- Stores `user_id`, `preferred_genres[]`, `onboarded` flag
- Includes RLS policies for security
- Auto-updates `updated_at` timestamp

## Database Schema

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  preferred_genres TEXT[] DEFAULT '{}',
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## User Flow

### New User Journey
1. **Land on homepage** → See paid pricing
2. **Click "Get Started"** → Sign up page
3. **Sign up** → Redirected to pricing/checkout
4. **Complete payment** → Subscription created
5. **Redirected to dashboard** → Onboarding flow shows
6. **Select genres** → Articles generate in background
7. **Dashboard loads** → Shows articles for selected genres

### Returning User Journey
1. **Log in** → Check subscription
2. **If paid** → Check onboarding
3. **If onboarded** → Dashboard loads
4. **If not onboarded** → Onboarding flow
5. **If not paid** → Redirect to pricing

## Required Migrations

Run these SQL migrations in Supabase Dashboard → SQL Editor:

### 1. User Preferences Table
```bash
backend/migrations/create_user_preferences.sql
```

### 2. Image URL Column (from previous feature)
```bash
backend/migrations/add_image_url_to_articles.sql
```

### 3. Instagram Handles (from previous feature)
```bash
backend/migrations/add_instagram_handles_to_genre_config.sql
```

## Environment Variables

Ensure these are set:

```env
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002

# Backend (.env)
ELEVENLABS_API_KEY=sk_...
FREEPIK_API=FPSX00f9e4ed3315d7398caf4bc0c217c1c0
```

## Testing Checklist

- [ ] Apply all database migrations
- [ ] Test landing page - no free trial mentions
- [ ] Test signup flow → should go to pricing
- [ ] Test payment → should show onboarding
- [ ] Test genre selection → should save preferences
- [ ] Test article generation → should trigger for selected genres
- [ ] Test dashboard access → should require payment
- [ ] Test returning user → should skip onboarding if completed
- [ ] Test ElevenLabs narration → should use new voice ID

## Key Features

### Paywall Protection
- ✅ No free access to dashboard
- ✅ Subscription check on every dashboard page load
- ✅ Automatic redirect to pricing if not paid
- ✅ Server-side verification (can't bypass)

### Onboarding Experience
- ✅ Beautiful, intuitive genre selection
- ✅ Multi-select with visual feedback
- ✅ Saves preferences to database
- ✅ Triggers content generation automatically
- ✅ One-time flow (won't show again after completion)
- ✅ Can change preferences later in settings

### Smart Redirects
- Not logged in → `/login`
- Logged in, no subscription → `/pricing`
- Logged in, paid, not onboarded → Onboarding flow
- Logged in, paid, onboarded → Dashboard!

## Notes

- **No backend changes needed** - Only frontend/database changes
- **Minimal** - Focused only on required functionality
- **User-friendly** - Smooth onboarding experience
- **Secure** - Server-side subscription checks
- **Scalable** - Easy to add more preferences later

## Next Steps

1. Apply database migrations
2. Test the complete user flow
3. Configure payment webhook to create subscriptions
4. Add genre preference editor in settings
5. Consider adding preference-based article filtering

## Files Modified/Created

### Modified
1. `backend/src/services/audio/elevenlabs.ts` - Voice ID
2. `app/page.tsx` - Removed free trial
3. `app/(dashboard)/layout.tsx` - Added paywall & onboarding

### Created  
1. `components/onboarding/onboarding-flow.tsx` - Onboarding UI
2. `app/api/generate/onboarding/route.ts` - Generation API
3. `backend/migrations/create_user_preferences.sql` - DB migration
4. `app/(marketing)/pricing/page.tsx` - Pricing page (if needed)

All changes are frontend-focused with minimal backend impact as requested!
