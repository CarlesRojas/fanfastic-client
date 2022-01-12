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
-   [ ] Call the apis. (The current console logs are runing to late)(On error, go back to the first stage and show the error).
-   [ ] Integrate page history
