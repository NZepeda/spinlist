# Sign-Up Page Implementation Summary

## Objective
Implement user sign-up functionality with Supabase authentication, including a sign-up page with email, username, password, and confirm password fields.

## Key Decisions Made

### Route & Validation
- **Page Route**: `/signup`
- **Validation**: Simple HTML5 validation
- **Error Display**: Inline below each field
- **Post-signup Flow**: Auto-login and redirect to home page (`/`)

### Data Architecture
- **Username Storage**: Create a `profiles` table in Supabase (separate from auth.users)
- **Authentication**: Supabase Auth with email/password
- **Profile Creation**: Automatic profile record creation after successful signup

### UI/UX
- **Form Fields**:
  1. Email (required, type="email")
  2. Username (required, 3-20 alphanumeric characters)
  3. Password (required, min 8 characters)
  4. Confirm Password (required, must match password)
- **Button**: "Sign up"
- **Footer Link**: "Already have an account? Login" → links to `/login`
- **Components**: Using existing shadcn/ui (Button, Input)

## Implementation Plan

### Phase 1: Database Setup ✓
Create `profiles` table in Supabase with:
- `id` (UUID, FK to auth.users)
- `username` (TEXT, unique, constrained format)
- `created_at` (timestamp)
- `updated_at` (timestamp with auto-update trigger)

**SQL to Run in Supabase Dashboard:**
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint for username format (3-20 alphanumeric characters, underscores allowed)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format
CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
```

### Phase 2: Business Logic Hook (Pending)
**File**: `src/hooks/useSignUp.ts`
- Form state management (email, username, password, confirmPassword)
- Error state for each field
- Loading state during submission
- `handleSignUp` function with validation and Supabase integration

### Phase 3: UI Component (Pending)
**File**: `src/app/signup/page.tsx`
- Client component with form
- 4 Input fields with proper attributes and error messages
- Submit button with loading state
- Link to login page

### Phase 4: Integration (Pending)
- Update `/login` page with link to `/signup`
- Test complete flow end-to-end

## File Structure
```
src/
├── app/
│   ├── signup/
│   │   └── page.tsx          # Sign-up page (to be created)
│   └── login/
│       └── page.tsx          # Login page (update link)
├── hooks/
│   └── useSignUp.ts          # Business logic hook (to be created)
└── lib/
    └── supabase/
        ├── client.ts         # ✓ Already exists
        ├── server.ts         # ✓ Already exists
        └── database.types.ts # Update after table creation
```

## Supabase Auth Flow
```typescript
// 1. Sign up user
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
});

// 2. Create profile (user is auto-logged in after signUp)
const { error: profileError } = await supabase
  .from('profiles')
  .insert({ id: authData.user!.id, username });

// 3. Redirect to home
router.push('/');
```

## Error Handling
- Email already registered → "An account with this email already exists"
- Username taken → "This username is already taken"
- Password mismatch → "Passwords do not match"
- Weak password → "Password must be at least 8 characters"
- Network errors → "Something went wrong. Please try again."

## Current Status
- [x] Planning complete
- [x] Decisions made
- [x] Database SQL prepared
- [ ] Database table created (waiting for manual execution in Supabase dashboard)
- [ ] useSignUp hook implementation
- [ ] Signup page implementation
- [ ] Login page update
- [ ] Testing

## Next Steps
1. Run the SQL in Supabase SQL Editor to create the `profiles` table
2. Regenerate TypeScript types: `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts`
3. Implement `useSignUp` hook
4. Create signup page component
5. Update login page with signup link
6. Test the complete flow

## Environment
- **Framework**: Next.js 16 (App Router)
- **Authentication**: Supabase Auth (@supabase/supabase-js v2.75.0)
- **UI Components**: shadcn/ui
- **State Management**: React hooks (following CLAUDE.md guidelines)
- **Package Manager**: pnpm
