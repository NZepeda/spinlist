# Plan: Verified Sign-Up and Pending Account Activation

> Source PRD: `plans/prd_verified_signup_pending_accounts.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - `/signup` remains the account-creation entry point.
  - A dedicated pending-confirmation route will own the post-sign-up and resend experience.
  - A dedicated auth callback route will own email-confirmation activation outcomes.
  - `/login` remains the credential entry point, but pending-account recovery can redirect back into the pending-confirmation flow.
- **Schema**:
  - `public.profiles` gains a first-class activation status with exactly two states: `pending` and `active`.
  - Username reservation still happens at sign-up by creating the profile immediately.
  - Public visibility rules must exclude pending profiles from public reads.
- **Key models**:
  - Auth user: provider-managed identity and canonical email-confirmation source.
  - Profile: application-facing account record with username and activation status.
  - Pending account: auth user plus `pending` profile with read-only access.
  - Active account: auth user plus `active` profile with participation privileges.
- **Authentication and authorization**:
  - `auth.users.email_confirmed_at` is the canonical confirmation truth.
  - The application synchronizes profile activation during the auth callback.
  - Only active profiles may create user-generated content.
  - Pending accounts may browse public content but may not participate.
- **Third-party boundaries**:
  - Supabase Auth owns sign-up, email confirmation, resend, and session creation.
  - Spinlist owns product-facing messaging, pending-account state, participation gating, and callback orchestration.
- **UX decisions**:
  - The verification email is also the welcome email.
  - The post-confirmation success banner copy is: `Thank you for confirming your email! Feel free to begin logging your listening journey.`
  - Resend interactions expose a visible 60-second cooldown while server-side throttling remains stricter behind the scenes.

---

## Phase 1: Pending Sign-Up Baseline

**User stories**: 1, 2, 4, 5, 6, 7, 8, 9, 13, 30, 31, 34

### What to build

Create the first end-to-end version of the new sign-up flow.
Signing up should create the auth user, reserve the username through a `pending` profile, send the welcome-verification email, and route the user to a dedicated pending-confirmation experience instead of the home page.
This slice establishes the product language, pending account model, and the initial schema and auth behavior needed for later phases.

### Acceptance criteria

- A successful sign-up creates a pending account and routes the user to a dedicated confirmation screen instead of the app home page.
- The verification email uses the agreed Spinlist welcome copy and confirmation CTA.
- The profile data model supports `pending` and `active` account states, with usernames reserved at sign-up.
- Automated tests cover sign-up outcomes, pending-account creation behavior, and normalized sign-up error handling.

---

## Phase 2: Confirmation Callback Activation

**User stories**: 20, 21, 22, 23, 26, 27, 30, 33

### What to build

Add the end-to-end activation path that begins when a user clicks the confirmation link in their email.
The callback should confirm the auth event, activate the pending profile, sign the user into Spinlist, and route them either into the app with the one-time success banner or into a friendly invalid-link outcome when activation cannot be completed.
This slice makes email confirmation a complete and demoable activation flow.

### Acceptance criteria

- Clicking a valid confirmation link activates a pending profile and signs the user into the app.
- The post-confirmation landing experience includes the agreed success banner copy.
- Invalid or unusable confirmation links resolve to a friendly recovery experience instead of a generic auth failure.
- Automated tests cover successful activation, repeated-link idempotency, and invalid-link outcomes.

---

## Phase 3: Pending Recovery and Resend Flow

**User stories**: 14, 15, 16, 17, 18, 19, 28, 29, 34, 35

### What to build

Extend the pending-account experience so unverified users can recover cleanly without support intervention.
The pending-confirmation screen should support resend, the login flow should recognize pending accounts and route users back into the confirmation experience, and all related messaging should stay generic where needed.
This slice completes the operational recovery path for unverified users.

### Acceptance criteria

- The pending-confirmation experience supports resend with a visible 60-second cooldown.
- Unverified login attempts route users into the pending-confirmation recovery flow with clear product language.
- Duplicate or pending-account scenarios keep outward messaging appropriately generic.
- Automated tests cover resend behavior, cooldown behavior, pending-login recovery, and normalized pending-account messaging.

---

## Phase 4: Participation Guard

**User stories**: 10, 11, 12, 25, 32, 36, 37

### What to build

Introduce the first production use of the activation gate for community participation.
Pending users should still be able to browse public content, but review creation and review mutation should require an active profile and should explain the restriction clearly when blocked.
This slice turns email verification into a real anti-spam control rather than a cosmetic onboarding step.

### Acceptance criteria

- Pending users can browse public content but cannot create or mutate reviews.
- Active users can continue to create and update reviews normally.
- Blocked participation paths return clear, product-facing feedback rather than generic authorization failures.
- Automated tests cover the participation gate at the UI and request-boundary levels.

---

## Phase 5: Pending Profile Visibility Rules

**User stories**: 24, 31, 32

### What to build

Finalize the public-account model by ensuring pending profiles are not treated as public community entities.
Public profile reads and any related public-facing joins should exclude pending profiles, while still preserving the internal and account-owner access needed for onboarding, activation, and authenticated account state.
This slice closes the remaining data-visibility gap in the pending-account model.

### Acceptance criteria

- Public profile reads exclude pending profiles.
- Pending profiles remain available to the system flows and authenticated account flows that require them.
- Existing public-facing experiences continue to behave correctly when pending profiles are present in the database.
- Automated tests cover pending-profile visibility rules and authorized access behavior.

