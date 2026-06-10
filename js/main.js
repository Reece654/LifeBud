

// applies the theme colours to the page
const theme = new Theme();
theme.applyToPage();

// gets the current page name from the url
const page = Navigation.getCurrentPage();

// sets up the welcome page buttons
if (page === "index.html" || page === "") {
  UI.setupWelcomePage();
}

if (page === "login.html") {
  UI.setupLoginPage();
}

if (page === "signup.html") {
  UI.setupSignupPage();
}

if (page === "app.html") {
  UI.setupAppPage();
}