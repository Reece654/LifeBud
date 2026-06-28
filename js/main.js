/*
  main.js
  entry point script, runs on every page.
  applies the theme then checks the current page name and calls the right setup function from ui.js
*/

// applies the theme colours to the page
// before the right css variables are set
const theme = new Theme();
theme.applyToPage();

// gets the current page name from the url
const page = Navigation.getCurrentPage();

// sets up the welcome page buttons
if (page === "index.html" || page === "") {
  UI.setupWelcomePage();
}

// sets up the signup page form and validation
if (page === "login.html") {
  UI.setupLoginPage();
}

// sets up the signup page form and validation
if (page === "signup.html") {
  UI.setupSignupPage();
}

// sets up the dashboard, checks the user is logged in first
if (page === "app.html") {
  UI.setupAppPage();
}