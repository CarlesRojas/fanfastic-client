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
-   [ ] Integrate page history
