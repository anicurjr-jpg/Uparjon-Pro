# Security Specifications and Threat Modeling

This document maps out the specific data invariants, threat vulnerabilities, and the "Dirty Dozen" audit vectors tested to enforce mathematical zero-trust on the Firestore security layer.

## Data Invariants & Zero-Trust Layout
1. **PII Seclusion**: No user profile `/users/{userId}` is readable or writeable by anyone other than the authenticated user matching `userId`.
2. **Referral Mapping Safety**: Referral mappings `/referrals/{referralCode}` can be created by any authenticated user for their own UID but are publicly read-only to permit invite lookup, containing no physical names, emails, or digits.
3. **Task and Cashout Integrity**: Withdrawals can only be initiated if the parent document matches `request.auth.uid`.

## The "Dirty Dozen" Vulnerability Payloads

1. **Identity Theft Spoofing**: Changing `/users/victim_uid` when authenticated as `attacker_uid`.
2. **Spam Referral Map Creation**: Registering a referral code redirecting to someone else's UID.
3. **Illegal Withdrawal Extraction**: Submitting a withdrawal log under another user's sub-collection `/users/victim_uid/withdrawals/txn_id`.
4. **Privilege Escalation**: Attempting to alter a `membership` tier directly from the client.
5. **Ghost Field Mutation**: Writing unmapped properties to user profile documents inside `/users/{userId}`.
6. **Self-Assigned High Balance**: Overwriting the `balance` field with artificial points on initialization.
7. **Negative Balance Hack**: Forcing `balance` to negative numbers to drain or confuse calculations.
8. **Negative Withdrawal Hack**: Requesting a withdrawal of negative Taka to artificially inflate current balance.
9. **Spam Index Injection**: Generating massive `1.5KB` long strings as ID identifiers to drive billing exhaustion.
10. **Immutable Timestamp Forgery**: Overriding the `createdAt` value during profile updates.
11. **Terminated State Mutation**: Overriding a cashout's status from `Pending` to `Approved` directly via the client.
12. **Unverified Account Writes**: Triggering task reward increments with `request.auth.token.email_verified == false` (or undefined).

## Firewall Verification Rules Specs

The exact corresponding permissions are implemented in `firestore.rules`.
