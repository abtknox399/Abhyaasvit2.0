# Quizrr feature benchmark for independent Abhyaas VIT implementation
Updated 21 Nov 2026. This is an **original functional analysis**, not a copy of Quizrr code, paid PDFs, or proprietary visual assets.

## Access and evidence
- User provided a Quizrr account login URL, but the authenticated app at https://app.quizrr.in/auth/login returns HTTP 403 to the accessible webpage reader. No private dashboard, tests, purchased PDFs, notes, or account settings were inspected; no private materials were copied.
- Public platform: https://www.quizrr.in/
- Public MathonGo site: https://www.mathongo.com/
- Public Quizrr sample analysis: https://testpreponline.s3.ap-south-1.amazonaws.com/assets/sample_report_card.pdf (historic example, not assumed to represent the current purchased interface).
- Source pages publicly advertise the real-exam test interface, 15-page detailed analytics, mistakes, revision notebook, leaderboard/comparative analysis, predicted percentile, video analysis and related learning resources. Not all features are included with every product or plan.
- Lists below distinguish documented public features from inferred design opportunities. A proper private inventory requires authenticated access in a supported cloud browser or user-supplied screenshots and document filenames. Never paste passwords into repository files.

## Publicly evidenced reference capabilities
| Category | Documented feature | Abhyaas VIT equivalent | Status and gaps |
| --- | --- | --- | --- |
| CBT | Real-exam interface | Timed CBT, subject tabs, five-color palette | Implemented; verify VIT exam-specific marking and duration |
| Test taxonomy | Full, part, chapter tests and PYQ-as-mocks | Unit, MSE, ESE, speed, custom and mistakes | Implemented; published VIT PYQs not yet verified |
| Review | Detailed question solutions and video analysis | Step solutions, AI misconception explanation fallback | Text review implemented; video not implemented |
| Analytics | 15-page diagnostics and time tracking | 15-part Abhyaas learning audit | Implemented, but not equivalent in depth |
| Attempts | Perfect, wasted, overtime, confused classifications in historic sample | Fast/Overtime × accurate/incorrect quadrants | Need unattempted-confused classification |
| Difficulty | Easy/moderate/tough distribution by subject | Difficulty stored on each question | Aggregated post-test difficulty view missing |
| Time Travel | Performance over successive exam intervals | Per-question time recorded | Timeline chart missing |
| Subject Movement | Subject switching counts and timeline | Subject tabs, visit counters | Subject-switch events missing |
| Painful Questions | Slow or costly questions identified | Weakest units, pacing bars | Dedicated painful-question ranking missing |
| Missed Concepts | Misconception/concept list | Per-question concept and weak-unit drill | Cross-test concept mastery needs data |
| Accuracy | Subject-wise time/attempt/accuracy | Overall and unit/subject score/time | Subject accuracy/time chart can be richer |
| Revision | My Mistakes, notebooks, categories | Tags, note, spaced repetition, flashcards | Implemented; improve cross-test queries |
| Benchmarks | Rank/percentile, comparative peer insights | No official claims until empirical cohort data | Purposefully absent; cannot invent ranks |
| Test video | Video solutions and paper strategy analyses (some products) | External video resource type not implemented | Add editor-managed source media |
| Notes/PDFs | Some publicly listed special notes and study materials | Original formula sheets, short notes, lab-viva cards | Need rights-cleared PDF upload, classification, reading, entitlements |

## Documented legacy sample report sections
Historic Quizrr report index explicitly contains: Overview; Time and Accuracy; Attempts; Difficulty Analysis; Time Travel; Painful Questions; Subject Movement; Missed Concepts; subject-specific question analyses. (Source: public sample PDF linked above.) Use these concepts to build an original VIT-specific analytics engine, not copy the report's proprietary formatting.

## VIT adaptation priorities
1. Make the existing CBT/attempt telemetry more accurate (dwell-time accounting, answer changes, submit persistence, time travel, subject movements).
2. Expand analytics to difficulty mix, time-period errors, expensive questions and repeated course-outcome gaps. Avoid unsupported predicted grades or peer ranks.
3. Build a curated VIT-native resource library with original or explicitly licensed formula PDFs, tutorial solutions, lab manuals and progress trackers; keep syllabus provenance and unit/section mapping.
4. Support typed media records, source permissions, access entitlements and private object storage for resources. Do not embed arbitrary student-uploaded PDFs into public URLs.
5. Add access plans after real subject content is published, not before.
6. Audit actual enrolled Quizrr account via supported authenticated browser. Record UI flows, visible buttons, menu trees, library filenames, titles, unit mapping, content type and permitted download/share flags only. Do not bulk-copy copyrighted paid materials.

## Publication criteria
A resource must have a source URL or author, creator/rights status, title, course code, unit, content type, publication state and admin approval before students can see it. Never label original drafts as genuine VIT PYQs.
