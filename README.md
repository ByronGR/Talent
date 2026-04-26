# Nearwork Talent

Candidate-facing Talent app for `talent.nearwork.co`.

## Setup

1. Run `npm install`.
2. Run `npm run dev`.
3. Optional: copy `.env.example` to `.env.local` if you want to override the bundled Nearwork Firebase web config for another environment.

## Firebase Data Pattern

The app follows the same Admin-facing Firebase shape by keeping candidate data in Firestore and writing application activity back for Admin workflows:

- `users/{uid}`: candidate profile, availability, role marker, timestamps.
- `openings/{openingCode}`: Admin-created roles surfaced to Talent when `published === true`.
- `pipelines/{pipelineCode}`: Admin-owned pipeline records Talent links back to by opening code.
- `applications/{applicationId}`: candidate submissions keyed by `candidateId` and `jobId`.
- `candidateActivity/{activityId}`: lightweight activity log entries for Admin visibility.

Existing Admin-created candidates are connected by email. On sign-in, the app checks `users/{auth.uid}` first; if that record does not exist, it queries `users` by the signed-in email and merges that candidate data into the Firebase Auth UID.

Enable these Firebase services for the full Talent flow:

- Authentication > Sign-in method > Google
- Authentication > Sign-in method > Email/Password, if candidates may create password accounts
- Storage, for candidate CV uploads

## Domain

`talent.nearwork.co` should point to the Vercel project that builds this folder. If the live domain returns an HTTP 400 from CloudFront, the DNS record is still pointed at an old AWS/Resend target instead of Vercel.

For Vercel, set the subdomain DNS to the value Vercel shows in Project Settings > Domains, commonly:

- `CNAME talent cname.vercel-dns.com`

Also add `talent.nearwork.co` in Firebase Authentication > Settings > Authorized domains so Google/email auth works after deployment.

The Desktop Admin files were treated as references only; this project does not edit or import those files.
