/*
  auth.js
  Handles sign up, login, logout using Supabase Auth.
  Returns success, message to match the UIs expectations
*/

const Auth = {

  // Logs the user in
  login: async function (email, password) {

    // email validation before doing anything
    const emailError = this.validateEmail(email);
      if (emailError) return { success: false, message: emailError };

    // password validation before doing anything
    const passwordError = this.validatePassword(password);
      if (passwordError) return { success: false, message: passwordError };

    // Sends the email and password to Supabase and waits for a response
    const result = await supabaseClient.auth.signInWithPassword({ email, password });
      if (result.error) return { success: false, message: result.error.message };

    // validates the login and tells the UI it worked
    return { success: true, message: "Logged in." };
  },

  // Creates a new account
  signup: async function (firstName, surname, email, password) {

    // name validation, checks first name and surname arent empty
    const firstNameError = this.validateName(firstName, "first name");
      if (firstNameError) return { success: false, message: firstNameError };
    const surnameError = this.validateName(surname, "surname");
      if (surnameError) return { success: false, message: surnameError };

    // email and password validation before doing anything
    const emailError = this.validateEmail(email);
      if (emailError) return { success: false, message: emailError };
    const passwordError = this.validatePassword(password);
      if (passwordError) return { success: false, message: passwordError };

    // Sends signup details to Supabase and waits for a response
    const result = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        // Supabase stores extra user info under user_metadata automatically
        // we save the name here so we can display it on the dashboard later
        data: { first_name: firstName.trim(), surname: surname.trim() }
      }
    });
    if (result.error) return { success: false, message: result.error.message };

    // validates signup and tells the UI the account was created
    return { success: true, message: "Account created. You can log in now." };
  },

  // checks the email field isnt empty and has an @ symbol
  validateEmail: function (email) {
    if (!email || email.trim() === "") return "Please enter your email.";
    if (email.indexOf("@") === -1) return "Email needs to include an @ symbol.";
    return "";
  },

  // checks the password isnt empty and is at least 6 characters long
  validatePassword: function (password) {
    if (!password || password.trim() === "") return "Please enter your password.";
    if (password.length < 6) return "Password should be at least 6 characters.";
    return "";
  },

  // checks a name field isnt empty, used for first name and surname
  validateName: function (name, label) {
    if (!name || name.trim() === "") return "Please enter your " + label + ".";
    return "";
  },

  // checks if the user is logged in before showing a page
  requireLogin: async function () {

    // session check, asks Supabase if there is an active session
    const result = await supabaseClient.auth.getSession();

    // no session means they arent logged in, sends them to the login page
    if (!result.data.session) {
      Navigation.goToLogin();
      return false;
    }

    // they are logged in, lets them through
    return true;
  },

  // gets the first letter of the users name to show in the profile icon
  getDisplayName: async function () {

    // session check, asks Supabase for the current session
    const result = await supabaseClient.auth.getSession();

    // no session or user, returns U as a fallback
    if (!result.data.session || !result.data.session.user) return "U";

    // user_metadata is what Supabase calls the extra info stored on a user
    const firstName = result.data.session.user.user_metadata.first_name;
    if (firstName) return firstName.charAt(0).toUpperCase();

    // falls back to the first letter of their email
    return result.data.session.user.email.charAt(0).toUpperCase();
  },

  // logs the user out and ends their Supabase session
  logout: async function () {

    // tells Supabase to end the session
    await supabaseClient.auth.signOut();
  }

};