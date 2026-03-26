# PRD: Verified Sign-Up and Pending Account Activation

## Problem Statement

Spinlist's current sign-up flow creates an account and immediately drops the user into the app without a clear email-confirmation step.
This makes the product feel incomplete, creates ambiguity about whether the account is actually ready, and leaves the review system exposed to low-friction spam.
Users need a clearer onboarding flow that explains what happens after sign-up, welcomes them to Spinlist, and prevents participation until they have proven ownership of their email address.

## Solution

Spinlist will introduce a verified sign-up flow built around pending accounts.
When a user signs up, Spinlist will create their auth user and reserve their username immediately, but their profile will remain in a `pending` state until they confirm their email.
After sign-up, the user will be sent to a dedicated confirmation screen that explains they need to verify their email and reassures them that Spinlist will not spam them.
The verification email itself will act as the welcome email.
When the user clicks the confirmation link, Spinlist will finalize activation through an auth callback, mark the profile as `active`, sign the user in, and redirect them into the app with a one-time success banner.
Pending accounts will be unable to create user-generated content, and pending profiles will not be publicly visible.

## User Stories

1. As a new listener, I want Spinlist to tell me I still need to confirm my email after signing up, so that I understand my account is not ready yet.
2. As a new listener, I want the post-sign-up screen to clearly explain that a confirmation email is on the way, so that I know what to do next.
3. As a new listener, I want reassuring language about why Spinlist is sending the email, so that the flow feels trustworthy and not spammy.
4. As a new listener, I want the verification email to feel like a welcome to Spinlist, so that onboarding feels intentional rather than transactional.
5. As a new listener, I want the verification email to tell me exactly what action I need to take, so that I can finish account creation quickly.
6. As a new listener, I want the verification email to include a clear confirmation button, so that I can activate my account with one click.
7. As a new listener, I want the verification email to make it clear that I can ignore it if I did not sign up, so that the message feels safe and responsible.
8. As a new listener, I want my username to be reserved as soon as I sign up, so that I do not lose it while completing verification.
9. As a new listener, I want my account to exist in a pending state before email confirmation, so that Spinlist can hold my registration without fully activating it.
10. As a pending user, I want to browse public content before verification, so that I can still explore Spinlist while deciding whether to continue.
11. As a pending user, I do not want to be able to rate, review, or otherwise create user-generated content, so that Spinlist limits spam and abuse.
12. As a pending user, I want Spinlist to tell me why I cannot participate yet, so that the restriction feels understandable rather than broken.
13. As a pending user, I want a dedicated confirmation screen I can return to, so that I always know where to resend or retry verification.
14. As a pending user, I want to be able to request a resend of the confirmation email, so that I can recover if the first message is lost.
15. As a pending user, I want resend actions to feel responsive, so that I trust Spinlist is helping me complete setup.
16. As a pending user, I want resend behavior to be rate-limited in the background, so that the product remains safe from abuse.
17. As a pending user, I want login to explain that my email still needs confirmation, so that I am not confused by a generic auth error.
18. As a pending user, I want failed login attempts to direct me back to the confirmation flow, so that I can recover without hunting through the app.
19. As a pending user, I want a resend option available from the login failure state, so that I can continue without extra navigation.
20. As a verified user, I want account activation to happen immediately after clicking the email link, so that I can start using Spinlist without another setup step.
21. As a verified user, I want to be signed in automatically after successful confirmation, so that the transition from email to app feels seamless.
22. As a verified user, I want to land in the app with a success banner, so that I know the confirmation worked.
23. As a verified user, I want the success message to invite me to begin logging my listening journey, so that the first product prompt reinforces the core behavior.
24. As a product owner, I want pending profiles hidden from public profile reads, so that unconfirmed accounts do not appear like real community members.
25. As a product owner, I want only active profiles to be allowed to create user-generated content, so that email verification is a real participation gate.
26. As a product owner, I want the activation flow to be idempotent, so that repeated confirmation-link clicks do not create broken states.
27. As a product owner, I want expired or invalid confirmation links to resolve to a friendly explanation, so that users are not dropped into a generic error state.
28. As a product owner, I want account-creation messaging to stay generic when a pending email already exists, so that the flow is more resistant to account enumeration.
29. As a product owner, I want login and resend flows to keep responses generic where appropriate, so that the app does not reveal unnecessary account state to attackers.
30. As a product owner, I want email confirmation to be the canonical activation checkpoint, so that the anti-spam control is simple to reason about.
31. As a developer, I want a first-class profile status in the application data model, so that product rules can be implemented cleanly across UI, APIs, and policies.
32. As a developer, I want a centralized participation guard for user-generated actions, so that future write paths inherit the same activation rule without copy-paste logic.
33. As a developer, I want the confirmation callback to own activation and post-confirmation routing, so that account finalization has one deterministic entry point.
34. As a developer, I want pending-account error states normalized into product language, so that the UI remains coherent even when the auth provider returns low-level errors.
35. As a support owner, I want unverified users to receive clear guidance instead of vague failures, so that onboarding creates fewer support requests.
36. As a security-conscious user, I want Spinlist to require email ownership before I can affect public community data, so that the community feels more trustworthy.
37. As a community member, I want new accounts to be verified before they can rate or review, so that the signal quality of Spinlist remains high.

## Implementation Decisions

- Introduce a profile activation status with exactly two states: `pending` and `active`.
- Continue creating the auth user and profile immediately at sign-up so usernames can be reserved up front.
- Treat `auth.users.email_confirmed_at` as the canonical activation truth and use the profile status as the application-facing gate that is synchronized during activation.
- Keep sign-up success out of the home page flow and redirect new users to a dedicated pending-confirmation experience.
- Use a dedicated pending-account UX module to own the confirmation page, resend interactions, failed-login recovery, and post-confirmation success messaging.
- Use the verification email as the welcome email instead of adding a second onboarding email after confirmation.
- Configure the verification email to use the finalized product copy:
  `Welcome to Spinlist! We're excited for you to join the community.`
  `Confirm your email to finish creating your account.`
  `Don’t worry, we promise not to spam you. This is just for security.`
  `If you didn’t create this account, you can ignore this email.`
- Use `Confirm my email` as the email CTA.
- Send confirmation links into a dedicated auth callback owned by Spinlist rather than relying on a generic redirect target.
- Make the callback responsible for validating the pending signup, activating the profile, signing the user in, and routing success versus expired-link outcomes.
- Require the callback activation path to be idempotent so repeated link clicks produce a safe result.
- Treat a missing pending profile, an expired pending profile, or an otherwise invalid activation attempt as an expired-link outcome rather than a generic failure.
- Block user-generated actions with a centralized participation guard that requires an authenticated user with an `active` profile.
- Start with review creation and review mutation paths, but define the rule broadly so future user-generated features reuse the same guard.
- Update profile visibility rules so pending profiles are not returned in public reads.
- Preserve the ability for account owners and internal system flows to access the pending profile state needed for onboarding and activation.
- Normalize login behavior for pending accounts so the user is guided back to the confirmation flow with clear product language and resend access.
- Keep email and resend flows generic when a pending account already exists for the submitted email.
- Support resend from both the pending-confirmation screen and the failed-login path.
- Show a visible resend cooldown of 60 seconds in the UI while still applying harder server-side throttling.
- Do not support changing username or email before confirmation in the first version.
- Show the following one-time success banner after activation: `Thank you for confirming your email! Feel free to begin logging your listening journey.`
- Keep pending accounts limited to read-only product access until activation.
- Avoid disposable-email blocking in the first version and rely on the activation gate as the primary anti-spam control.
- Favor deep modules over scattered inline checks:
  - Pending account lifecycle
  - Email confirmation activation
  - Pending-account UX
  - Participation guard
  - Profile visibility policy

## Testing Decisions

- Good tests should validate observable behavior and user-meaningful outcomes rather than internal implementation details.
- Tests should assert contract-level behavior for state transitions, routing outcomes, visibility rules, and participation gating.
- Tests should avoid depending on incidental control flow, internal helper structure, or provider-specific implementation quirks that are not part of the app's promised behavior.
- The pending account lifecycle module should be tested for sign-up outcomes, username reservation behavior, duplicate and pending-account handling, and normalized error mapping.
- The email confirmation activation module should be tested for successful activation, repeated-link idempotency, expired-link handling, and invalid-pending-state handling.
- The pending-account UX should be tested at the behavior level for pending-confirmation routing, resend availability, visible cooldown behavior, failed-login recovery, and post-confirmation success messaging.
- The participation guard should be tested to ensure pending users cannot create or mutate user-generated content while active users can proceed normally.
- The profile visibility policy should be tested to ensure public reads exclude pending profiles while authorized flows continue to work correctly.
- Prior art for behavior-first auth action tests exists in the codebase's sign-up and login action tests.
- Prior art for provider-state bootstrap and auth-driven UI tests exists in the codebase's auth provider tests.
- Prior art for API-level review behavior tests should continue to guide how participation-gating behavior is validated at request boundaries.

## Out of Scope

- OAuth provider onboarding changes.
- Disposable-email-domain blocking.
- Editing email or username before confirmation.
- New user-generated content systems beyond ensuring the participation guard is designed for reuse.
- A second post-confirmation welcome email.
- Profile-page feature work beyond ensuring pending profiles are not public.

## Further Notes

- The welcome and verification email are intentionally combined into a single message to keep the flow simple and avoid unnecessary email volume.
- The anti-spam objective is product-level, not merely cosmetic, so the activation requirement must be enforced server-side and not only in the UI.
- The design should keep future user-generated features aligned with the same activation rule from day one.
