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

The Desktop Admin files were treated as references only; this project does not edit or import those files.
