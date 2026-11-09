# Real-iPhone smoke test

`npm run test:ios` runs the student sign-in flow on one real iPhone per iOS
major (14 → 27, iPhone 12 or newer) on BrowserStack Automate:

1. `/welcome` hydrates (React actually started; the page isn't just server HTML)
2. type the class code → Join
3. tap the test student's card
4. land on `/subject/…`, hydrated
5. *(optional)* open an assignment and its **Your work** sheet

Any uncaught page error along the way fails the run. A failure saves a
screenshot to `tests/ios/artifacts/` and prints the BrowserStack session link
(video and console log are there).

The matrix is `MATRIX` in `run-ios.mjs`. Update it when BrowserStack adds an
iOS version (`list_browsers` in the BrowserStack MCP, or their device list).

## Run it

Easiest: copy `tests/ios/.env.example` to `tests/ios/.env` (gitignored) and
fill it in; `npm run test:ios` loads it. Real environment variables win over
the file. Or export them in the shell:

```sh
export BROWSERSTACK_USERNAME=…      # BrowserStack → Account → Access keys
export BROWSERSTACK_ACCESS_KEY=…
export BASE_URL=https://…           # where the build under test is served
export TEST_SUBJECT_CODE=60ccf5     # a class in the database that BASE_URL's API uses
export TEST_STUDENT=Emily           # a student in it WITHOUT a password
# optional: also open an assignment's Your work sheet
export TEST_SUBJECT_ID=69d4d743e341d084e767eb05
export TEST_ASSIGNMENT_ID=69d4d745e341d084e767eb4a

npm run test:ios                    # all iOS versions, 2 at a time
IOS=15,16 npm run test:ios          # just these
PARALLEL=5 npm run test:ios         # if your plan allows more parallels
```

The values above are the development database's test class
(`ภาษาไทย`, student no. 2 Emily, assignment "Hi").

## Where BASE_URL points

BrowserStack's phones must be able to open `BASE_URL`:

- **A deployed build** (Netlify deploy preview or production): just set
  `BASE_URL`. The class code must exist in that deployment's database.
- **Your machine** (`npm run build && npm start`, port 8282): run
  [BrowserStack Local](https://www.browserstack.com/docs/automate/selenium/local-testing)
  with your access key, then
  `BROWSERSTACK_LOCAL=true BASE_URL=http://localhost:8282 npm run test:ios`.
  The app's `NEXT_PUBLIC_SERVER_URL` must also be reachable from the phone.

## Limits

Automated iOS Safari focuses fields **without showing the keyboard**, so
keyboard bugs (like the sheet shake fixed in #67) still need a manual
BrowserStack Live session.

## Related guard

`npm run build` now runs `scripts/check-browser-compat.mjs` afterwards. It
parses every client chunk and fails the build on syntax iOS 14 can't parse
(class static blocks, RegExp lookbehind, the RegExp `v` flag, private methods).
That catches the "nothing is tappable on older iPhones" bug before deploy; this
smoke test confirms it on real devices.
