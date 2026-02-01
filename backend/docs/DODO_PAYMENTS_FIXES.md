# Dodo Payments & Subscription Fixes

## Overview
Fixed implementation issues where the Dodo Payments webhook and frontend checks were mismatched regarding database tables and property names.

## Fixes Implemented

### 1. ✅ Webhook Handler (`api/webhooks/dodo-payments/route.ts`)
**Issue**: 
- Was trying to access `customer.id` which doesn't exist (should be `customer.customer_id`).
- Was checking `payload.event_type` which doesn't exist (should be `payload.type`).

**Fix**:
- Updated to use `payload.data?.customer?.customer_id`.
- Updated to use `payload.type`.
- This ensures the `profiles` table is correctly updated with the `dodo_customer_id` and subscription status.

### 2. ✅ Dashboard Access (`(dashboard)/layout.tsx`)
**Issue**: 
- Was querying `subscriptions` table (which doesn't exist or isn't used).
- Dodo webhook updates `profiles` table.

**Fix**:
- Updated `checkSubscriptionStatus` to query the `profiles` table.
- Checks `subscription_status === 'active'`.

### 3. ✅ Pricing Page Redirect (`(marketing)/pricing/page.tsx`)
**Issue**:
- Also querying `subscriptions` table.

**Fix**:
- Updated to query `profiles` table for active subscription check.

## Verification Flow

1. **User Pays via Dodo**
   - Webhook triggers `onSubscriptionActive`.
   - Extracts `customer_id` from payload correctly.
   - Updates `profiles` table:
     - `subscription_status` = 'active'
     - `subscription_tier` = 'pro' (or enterprise)
     - `dodo_customer_id` = 'cus_...'

2. **User Navigates to Dashboard**
   - `dashboard/layout.tsx` runs.
   - Queries `profiles` table for user's ID.
   - Finds `subscription_status` is 'active'.
   - Allows access.

3. **Onboarding Check**
   - Layout then checks `user_preferences` table.
   - If not onboarded -> shows `OnboardingFlow`.
   - If onboarded -> shows Dashboard.

## Notes
- The system correctly uses the `profiles` table as the single source of truth for subscription status, synced via webhooks.
