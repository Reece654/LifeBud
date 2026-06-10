
class Navigation {

  // sends the user back to the welcome page
  static goToWelcome() {
    window.location.href = "index.html";
  }

  // sends the user to the login page
  static goToLogin() {
    window.location.href = "login.html";
  }

  // sends the user to the signup page
  static goToSignup() {
    window.location.href = "signup.html";
  }

  // sends the user to the apps dashboard after the user logs in 
  static goToApp() {
    window.location.href = "app.html";
  }

// gets the current page name from the url, used by main.js to pick which setup to run
  static getCurrentPage() {

    // splits the url by / and grabs the last part which is the filename
    const parts = window.location.pathname.split("/");
    const fileName = parts[parts.length - 1];

    // falls back to index.html if no filename is found in the url
    return fileName || "index.html";
  }
}