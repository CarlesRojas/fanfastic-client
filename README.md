# Fanfastic

Keep track of your fasting schedule in a healthy way.

## Run locally

Run `npm start` and open this address `localhost:3000` on any browser.

## Deploy

**First time**
Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/):
`npm install netlify-cli -g`

Login to Netlify with:
`netlify login`

**Every time**
Run this (If prompted to choose a site, choose `estado-covid`):
`npm run deploy`

## TO DO:

-   [x] When calling nextPage on the last page in usePageAnimation, animate it.
-   [x] Add initial data to cards so when going back they mantaign the data
-   [x] Auth should be a usePageAnimation with only one stage, deepending on the data, we call one of the other two
-   [x] We will need a way to also animate the first card in a stage, for all except the welcome
-   [x] Different components for the different pickers
-   [x] Bug with adding characters after validating in an input container
-   [x] Loading icon on input enter
-   [x] Call the apis.(On error, go back to the first stage and show the error).
-   [x] Handle start and stop fasting API errors.
-   [x] Better animation when going from not fasting to fasting (Join them again?)
-   [x] Fade out - fade in when the user starts or stops fasting
-   [x] Timer seconds reset every time we return to the page (Fix bug)
-   [x] Integrate page history
-   [x] When user is fasting and remaining time reaches 00:00:00 -> change to show a timer of the fasting duration.
-   [x] End fasting screen where user can change the start and end time
-   [x] Popup when user starts fasting to change time.
-   [x] Don't show the start fasting if user already fasted today.
-   [x] End fasting popup -> Limit hours and send the edited time to the API
-   [x] When weight objective is achieved, show a button to set a new one
-   [x] Add date when user used last weekly pass to user model (API)
-   [x] When user uses weekly pass when not fasting, the time until the next time is wrong (Should be 21 tomorrow instead of today)
-   [x] If the pass is used while fasting we need to check if the user started fasting today or yesterday and thhe next time should change according to that.
-   [x] Fix calendar text size on tablet and desktop
-   [x] Change notifications text
-   [x] Add button cursor and animation on non touch devices
-   [x] Change html font-size to 20 on desktop and 18 on tablet
-   [x] Remove fast from "Fast streak"
-   [x] Remove username from account.
