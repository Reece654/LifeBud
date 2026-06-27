const UI = {

  // We call this from main.js when the welcome page loads. Its job is to attach click handlers to the two entry buttons so they change page through Navigation instead of relying on raw links alone.
  setupWelcomePage: function () {

    // We use getElementById to find the buttons by the id values set in index.html. If either id is missing the matching variable stays null and we skip wiring that button so the rest of the page still runs.
    const loginButton = document.getElementById("welcome-login");
    const signupButton = document.getElementById("welcome-signup");

    // addEventListener registers a function that runs when the person clicks. Inside that function we call Navigation.goToLogin which changes window.location to login.html so the browser loads the login page.
    if (loginButton) {
      loginButton.addEventListener("click", function () {
        Navigation.goToLogin();
      });
    }

    // The signup button works the same way but calls goToSignup so the person lands on signup.html ready to create an account.
    if (signupButton) {
      signupButton.addEventListener("click", function () {
        Navigation.goToSignup();
      });
    }
  },

  // We call this when login.html loads. We hook up the form submit, read field values, send them to auth, show errors on the page, and only navigate to the app when Supabase accepts the credentials.
  setupLoginPage: function () {

    // We look up three ids from login.html so JavaScript can talk to the right parts of the page. The form is where our users will enter there email and password, the error box is the space below where failed login messages appear, and the signup link is the text someone clicks when they need to create an account instead.
    
    const form = document.getElementById("login-form");
    const errorBox = document.getElementById("login-error");
    const signupLink = document.getElementById("go-signup");

    // The signup text is a link in the html that would normally open a new page on its own. We add code that runs when it is clicked so we can send the person to signup through Navigation and keep page changes working the same way as our welcome buttons.
    
    if (signupLink) {

      // preventDefault keeps the browser from following the href. Navigation.goToSignup then loads signup.html the same way our button handlers do.

      signupLink.addEventListener("click", function (event) {
        event.preventDefault();
        Navigation.goToSignup();
      });
    }

    // main.js may load ui.js on several pages. If login.html is not the current page the form will not be on the page and we return early instead of trying to set up submit code when there is no form to work with.
    
    if (!form) {
      return;
    }

    // submit fires when the person presses enter or clicks the submit button. preventDefault stops a full page reload. async lets us wait for Auth.login which is a network call to Supabase.
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Each input has an id in the html. Reading .value gives us the plain text the person typed before we send it anywhere.
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      // Auth.login validates locally first, then calls supabaseClient.auth.signInWithPassword. It always returns an object with success true or false and a message we can show in the ui.
      const result = await Auth.login(email, password);

      // When success is false we write result.message into the error box textContent so it appears under the form and we return so we never call goToApp.
      if (!result.success) {
        errorBox.textContent = result.message;
        return;
      }

      // On success we clear leftover error text so an old message does not show next time, then Navigation.goToApp sends the person to app.html where the dashboard loads.
      errorBox.textContent = "";
      Navigation.goToApp();
    });
  },

  // We call this when signup.html loads. 
  // We set up the link back to login, listen for form submit, pass field values to auth, colour the feedback message, and redirect to login after a short pause on success.

  setupSignupPage: function () {

    // The form holds the inputs, messageBox is where success or error text appears, and loginLink is the anchor that should send someone back to login without a full reload if we handle it in js.

    const form = document.getElementById("signup-form");
    const messageBox = document.getElementById("signup-message");
    const loginLink = document.getElementById("go-login");

    // Same pattern as the signup link on the login page. preventDefault stops the default anchor behaviour and Navigation.goToLogin loads login.html through our shared helper.

    if (loginLink) {

      // The click handler runs before the browser follows the link. We block that default path and navigate ourselves so behaviour stays consistent across the app.
      
      loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        Navigation.goToLogin();
      });
    }

    // If signup.html is not open the form will not exist on the page. 
    // We stop here rather than trying to connect submit code to something that is missing, which would cause an error.

    if (!form) {
      return;
    }

    // When the person sends the signup form we stop the browser from reloading the page, then we wait for auth to finish talking to Supabase before we show success or failure.

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // We read each input one at a time because auth checks names, email shape, and password length on its own before it tries to create the account online.

      const firstName = document.getElementById("signup-first-name").value;
      const surname = document.getElementById("signup-surname").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      // We send all four values to auth.signup. Auth stores the names with the new account in Supabase and sends back success or an error message we can show on the page.

      const result = await Auth.signup(firstName, surname, email, password);

      // When signup fails we put the error words into the message box and colour them light red so the problem is easy to spot straight away.

      if (!result.success) {
        messageBox.textContent = result.message;
        messageBox.style.color = "#ffb4b4";
        return;
      }

      // When signup works we switch the message colour to our theme accent and show the success words from auth so the tone matches the rest of the app.

      messageBox.style.color = "var(--color-accent-light)";
      messageBox.textContent = result.message;

      // We wait (900 milliseconds) before opening login so the person has time to read the success message, then Navigation loads the login page for them.

      setTimeout(function () {
        Navigation.goToLogin();
      }, 900);
    });
  },

  // We use this on the dashboard whenever we need a quick message that does not block the screen. 
  // It finds or creates a small banner, shows the words, then hides it again after a few seconds.

showToast: function (message) {
    let toast = document.getElementById("toast");

    // The first time we need a toast banner it is not in the html yet. We create a div, give it the right id and classes, and add it to the page body so our css can pin it near the bottom.

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast is-hidden";
      document.body.appendChild(toast);
    }

    // We set the message text and remove the hidden class so our styles make the banner appear. We reuse the same div each time instead of making a new one every toast.

    toast.textContent = message;
    toast.classList.remove("is-hidden");

    // After some time we add the hidden class back. The banner disappears through css and stays in the page ready for the next message.

    setTimeout(function () {
      toast.classList.add("is-hidden");
    }, 2800); // 2.8 seconds
  },

  // renderTaskList calls this for every task in a list. We build each card in code rather than writing html by hand, then return the finished piece so the list area can display it.

  makeTaskCard: function (task) {

    // We create a new article element in memory and pick a css class from the priority so the card border colour can reflect how urgent the task is.

    const card = document.createElement("article");
    const priorityKey = (task.priority || "Medium").toLowerCase();
    card.className = "task-card task-card--priority-" + priorityKey;

    // The heading shows the task title. We give it our card title class so it matches every other task without extra styling on this line.

    const title = document.createElement("h3");
    title.className = "task-card__title";
    title.textContent = task.title;

    // This row sits under the title and holds the small tags for priority and due date so they line up on one row through our stylesheet flex rules.

    const meta = document.createElement("div");
    meta.className = "task-card__meta";

    // We always show priority as a small tag. The text comes straight from the task data we loaded from storage or Supabase.

    const priorityPill = document.createElement("span");
    priorityPill.className = "task-card__pill";
    priorityPill.textContent = task.priority;
    meta.appendChild(priorityPill);

    // A due date is optional. We only add a second tag when one exists so tasks without a deadline do not show an empty label.

    /* Our date currently displays in (YYYY-MM-DD) format as that is how Supabase and the
       HTML date input store it. 
       We are leaving it like this for now because we plan to replace
       this line with getDueDateLabel() from Task.js in a later sprint. That method will show
       friendlier text instead of the raw date, such as "Due today" or
       "Overdue by 1 day". We will wire that in at the same time as the completed tasks and
       upcoming tasks features, since all three rely on the same date logic in Task.js. */
       
    if (task.dueDate) {
      const datePill = document.createElement("span");
      datePill.className = "task-card__pill";
      datePill.textContent = task.dueDate;
      meta.appendChild(datePill);
    }

    // We put the title and tag row inside the card in order. The card is not visible on screen until renderTaskList adds it to the task list area.

    card.appendChild(title);
    card.appendChild(meta);

    // Longer notes only show when the task has a description. We use a muted theme colour and a little space below so the text sits clearly above the buttons.

    if (task.description) {
      const notes = document.createElement("p");
      notes.textContent = task.description;
      notes.style.color = "var(--color-text-muted)";
      notes.style.marginBottom = "0.75rem";
      card.appendChild(notes);
    }

    // This row holds the edit and delete buttons side by side. We set flex layout here so the two buttons stay evenly spaced at the bottom of the card.

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "0.5rem";

    // Edit is a plain button so clicking it does not submit a form by mistake. When pressed we open the edit panel with this same task data already filled in.

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn--primary btn--small";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      UI.openEditTask(task);
    });

    // When someone presses delete the browser shows a simple yes or no question so they do not remove a task by mistake. 
    // If they choose yes we tell Tasks to delete that task from storage using its id, then we load the task list again so the card disappears from the page, and we show a brief message at the bottom of the screen so they know it worked.
    
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn--dark btn--small";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async function () {
      const confirmed = window.confirm("Delete this task?");
      if (confirmed) {
        const result = await Tasks.remove(task.id);
        if (result.success) {
          await UI.refreshDashboard();
          UI.showToast("Task removed.");
        } else {
          UI.showToast(result.message);
        }
      }
    });

    // We place both buttons inside the action row and the action row inside the card so we return one complete block ready to drop into the list.

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(actions);

    return card;
  },

  // This refreshes what our users see in the task list. 
  // We update the heading, load tasks for that list name, clear the old cards, then either show an empty message or draw new cards one by one.

  renderTaskList: async function (listName) {
    const heading = document.getElementById("active-list-heading");
    const taskArea = document.getElementById("task-list-area");

    // We replace the heading text with the list name passed in so the user always knows which list they are looking at.

    if (heading) {
      heading.textContent = listName;
    }

    // The task list area is the empty box in app.html where cards go. If it is missing we cannot show anything so we stop before loading tasks.

    if (!taskArea) {
      return;
    }

    // We ask Tasks for every task in this list and wait for the answer. We then wipe the list area clean so old cards do not stack on top of new ones.
    
    const tasks = await Tasks.getByList(listName);
    taskArea.innerHTML = "";

    // When there are no tasks we drop in a friendly empty message instead of leaving a blank space.


    if (tasks.length === 0) {
      taskArea.innerHTML = '<div class="empty-state">No tasks yet. Add one above.</div>';
      return;
    }

    // We loop through each task in order, build a card for it, and add that card to the bottom of the list area so they appear as a vertical stack.

    tasks.forEach(function (task) {
      taskArea.appendChild(UI.makeTaskCard(task));
    });
  },

  // When someone presses edit on a card we copy that task into the hidden edit form and show the slide out panel. The hidden id field tells saveEditTask which stored task to update later.

  openEditTask: function (task) {
    const panel = document.getElementById("edit-task-panel");
    const idInput = document.getElementById("edit-task-id");
    const titleInput = document.getElementById("edit-task-title");
    const listInput = document.getElementById("edit-task-list");
    const priorityInput = document.getElementById("edit-task-priority");
    const dueDateInput = document.getElementById("edit-task-due-date");
    const notesInput = document.getElementById("edit-task-notes");

    // We need the panel and the id and title fields before we can edit safely. If any of those are missing we stop rather than writing into fields that are not there.

    if (!panel || !idInput || !titleInput) {
      return;
    }

    // We copy each value from the task into the matching input. Optional fields that are empty become blank strings so the inputs never show the word undefined.

    idInput.value = task.id;
    titleInput.value = task.title;

    // pre-selects whichever list this task is currently in
    if (listInput) listInput.value = task.listName;

    priorityInput.value = task.priority;
    dueDateInput.value = task.dueDate || "";
    notesInput.value = task.description || "";

    // We remove the hidden class so the panel appears on screen. We also set aria hidden to false so screen readers know the form is open and can read it out.

    panel.classList.remove("is-hidden");
    panel.setAttribute("aria-hidden", "false");
  },

  // We call this after a successful save or when the person presses cancel. We hide the panel and clear the form so the next edit starts fresh without old values hanging around.

  closeEditTask: function () {
    const panel = document.getElementById("edit-task-panel");
    const form = document.getElementById("edit-task-form");

    // We add the hidden class to tuck the panel away and tell assistive tech it is closed even though the html stays in the page for next time.

    if (panel) {
      panel.classList.add("is-hidden");
      panel.setAttribute("aria-hidden", "true");
    }

    // Resetting the form clears every field including the hidden id so we do not accidentally save changes against the wrong task later.

    if (form) {
      form.reset();
    }
  },

  // The edit form runs this when the person saves.
  // We read the fields, trim extra spaces, send the update through Tasks, then either show an error toast or close the panel and refresh the list.

  saveEditTask: async function () {
    const idInput = document.getElementById("edit-task-id");
    const titleInput = document.getElementById("edit-task-title");
    const listInput = document.getElementById("edit-task-list");
    const priorityInput = document.getElementById("edit-task-priority");
    const dueDateInput = document.getElementById("edit-task-due-date");
    const notesInput = document.getElementById("edit-task-notes");

    // We need the hidden id to know which task to update and a title so the task is not blank. Without both we stop before calling Tasks.update.
    if (!idInput || !titleInput) {
      return;
    }

    // We trim spaces from text fields and pack the values into one object that matches what Tasks.update expects, then we wait for storage to confirm the save.

    const result = await Tasks.update(idInput.value, {
      title: titleInput.value.trim(),
      listName: listInput ? listInput.value : "",
      description: notesInput ? notesInput.value.trim() : "",
      priority: priorityInput ? priorityInput.value : "Medium",
      dueDate: dueDateInput ? dueDateInput.value : ""
    });

    // If the save fails we keep the panel open so the person can fix their input and we show the error in a toast at the bottom of the screen.

    if (!result.success) {
      UI.showToast(result.message);
      return;
    }

    // If the save works we close the panel, load the task list again so the card shows the new text, and show a quick toast so the person knows it saved.

    UI.closeEditTask();
    await UI.refreshDashboard();
    UI.showToast("Task updated.");
  },

  // tracks whichever list is currently shown on the dashboard
  // defaults to General until something else gets selected
  activeListName: "General",

  // getActiveList returns whatever list is currently selected
  getActiveList: function () {
    return UI.activeListName;
  },

  // setActiveList updates state when a different list gets picked
  // sidebar buttons and the list dropdown will call this once they exist
  setActiveList: function (listName) {
    UI.activeListName = listName;
  },

  // ensureActiveListExists makes sure the active list is something that actually exists
  // creates General if the user has no lists at all, and falls back to the first real list
  // if the active list does not match any real list, like if general was assumed but never created
  ensureActiveListExists: async function () {
    let lists = await Lists.getAll();

    // creates a default General list if this user genuinely has none yet
    if (lists.length === 0) {
      await Lists.add("General");
      lists = await Lists.getAll();
    }

    // checks whether the currently active list name actually matches one of the real lists
    const activeListIsReal = lists.some(function (name) {
      return name === UI.getActiveList();
    });

    // falls back to whichever list is first if the active one turned out to be fake
    // e.g. general was assumed active but was never actually created
    if (!activeListIsReal) {
      UI.setActiveList(lists[0]);
    }
  },

  // After any add, edit, or delete we call this so the screen stays in sync with storage.
  // Refreshes the dashboard for whichever list is currently active.

  refreshDashboard: async function () {
    await UI.renderTaskList(UI.getActiveList());
  },
 
  // fillListDropdown builds the options inside task list and edit task list
  // pulls every list name from Supabase so both dropdowns show real lists

  fillListDropdown: async function () {
    const lists = await Lists.getAll();

    const taskListSelect = document.getElementById("task-list");
    const editListSelect = document.getElementById("edit-task-list");

    // clears out old options first so refreshing does not just keep stacking duplicates
    if (taskListSelect) taskListSelect.innerHTML = "";
    if (editListSelect) editListSelect.innerHTML = "";

    // builds one option per list name and drops it into both dropdowns
    lists.forEach(function (name) {
      // only builds an option if the add task dropdown actually exists on the page
      if (taskListSelect) {

        // builds a new option for this list name and adds it onto the end of the add task dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        taskListSelect.appendChild(option);
      }
      // does the exact same thing as above but for the edit task dropdown instead
      if (editListSelect) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        editListSelect.appendChild(option);
      }
    });

    // defaults the add task dropdown to whatever list is currently active
    // so it lines up with the heading and task cards already on screen instead of jumping back to the first option
    if (taskListSelect) {
      taskListSelect.value = UI.getActiveList();
    }
  },

  // This part builds the row of list buttons that sit in the sidebar on the left side of the page.
  // We make one button for every list the person has, so they always have a way to jump between
  // their different lists. Clicking on one of these buttons is what changes which list is currently
  // showing in the middle of the page.
  fillListButtons: async function () {
    const lists = await Lists.getAll();
    const listButtonsContainer = document.getElementById("list-buttons");
    if (!listButtonsContainer) return;

    // We empty out the sidebar first before adding the buttons back in. Without this step, every
    // time the row of buttons gets rebuilt the old ones would stay on the page and the new ones
    // would just pile up underneath them.
    listButtonsContainer.innerHTML = "";

    lists.forEach(function (name) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn--list";
      button.textContent = name;

      // Here we check if this particular list is the one currently being shown, and if it is we
      // give the button a different colour. This makes it clear to the person which list they are
      // currently looking at, since the matching button stands out from the others.
      if (name === UI.getActiveList()) {
        button.classList.add("is-active");
      }

      // This is the code that runs when someone clicks one of the list buttons. First we update
      // which list is currently active, then we redraw the task list and heading so they match the
      // list that was just picked. We also rebuild the dropdown menus on the add and edit task forms
      // here, since otherwise they would keep showing whichever list was active when the page first
      // loaded rather than the one the person just switched to. Finally we redraw the sidebar buttons
      // themselves so the highlighted one moves to match.
      button.addEventListener("click", async function () {
        UI.setActiveList(name);
        await UI.refreshDashboard();
        await UI.fillListDropdown();
        await UI.fillListButtons();
      });

      listButtonsContainer.appendChild(button);
    });
  },

  // main.js runs this when app.html opens. We check the person is logged in, fill in the profile initial, load tasks, then connect every dashboard button and form to the right actions.

  setupAppPage: async function () {

    // Auth.requireLogin looks for a valid Supabase session. If nobody is signed in auth sends them to login and returns false so we do not set up private task features for a guest.

    const loggedIn = await Auth.requireLogin();

    // When loggedIn is false the redirect is already happening so we simply stop and leave the rest of this function alone.

    if (!loggedIn) {
      return;
    }

    // Auth.getDisplayName picks a single letter from the signed in user details. We show that letter in the profile circle so the header feels personal without opening a profile page. 
    // Eventually we plan to add a full profile page.

    const profileIcon = document.getElementById("profile-icon");
    if (profileIcon) {
      profileIcon.textContent = await Auth.getDisplayName();
    }

    
    // makes sure the active list genuinely exists before we draw anything using it
    await UI.ensureActiveListExists();

    // We draw the active list's tasks right away so they appear as soon as the page loads and the person does not need to click anything first.
    await UI.refreshDashboard();
    await UI.fillListDropdown();

    // This builds the list buttons in the sidebar so the person has something to click on as soon
    // as the page loads.
    await UI.fillListButtons();

    // opens the realtime channel so the dashboard updates straight away if a task changes
    // on another device signed into the same account, no manual refresh needed
    Tasks.subscribeToChanges();

    // does the same thing but for lists, so the sidebar and dropdowns update straight away too
    Lists.subscribeToChanges();

    // grabs the button, the hidden panel, the text input, and the confirm button by id
    const addListButton = document.getElementById("add-list-btn");
    const addListPanel = document.getElementById("add-list-panel");
    const newListNameInput = document.getElementById("new-list-name");
    const confirmAddListButton = document.getElementById("confirm-add-list-btn");

    // clicking add list just reveals the hidden panel, nothing saved yet
    if (addListButton && addListPanel) {
      addListButton.addEventListener("click", function () {

        // removing is-hidden makes the panel appear, same way the edit task panel works
        addListPanel.classList.remove("is-hidden");
      });
    }

    // clicking confirm is what actually saves the new list
    if (confirmAddListButton) {
      confirmAddListButton.addEventListener("click", async function () {

        // reads whatever the person typed into the input, empty string if the input is missing
        const name = newListNameInput ? newListNameInput.value : "";

        // sends the typed name to Supabase through Lists.add and waits for the result
        const result = await Lists.add(name);

        // if it fails (e.g. blank name) we leave the panel open so they can fix it and try again
        if (!result.success) {
          UI.showToast(result.message);
          return;
        }

        // clears the input and hides the panel again now the list is saved
        if (newListNameInput) newListNameInput.value = "";
        addListPanel.classList.add("is-hidden");

        // rebuilds both dropdowns so the new list shows up right away
        await UI.fillListDropdown();

        // rebuilds the sidebar too, otherwise the new list only shows up in the dropdowns until something else refreshes it
        await UI.fillListButtons();

        UI.showToast("List added.");
      });
    }

    // Logout runs Auth.logout to end the Supabase session on this device, then Navigation sends the person back to the welcome page as if they were never signed in.

    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        await Auth.logout();
        Navigation.goToWelcome();
      });
    }

    // The edit form lives in the slide out panel. Saving runs saveEditTask without reloading the page. Cancel only hides the panel and does not write anything to storage.

    const editTaskForm = document.getElementById("edit-task-form");
    const cancelEditButton = document.getElementById("cancel-edit-btn");

    if (editTaskForm) {
      editTaskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        UI.saveEditTask();
      });
    }

    if (cancelEditButton) {
      cancelEditButton.addEventListener("click", function () {
        UI.closeEditTask();
      });
    }

    // The add task form sits above the list. 
    // When it is sent we read the fields, store a new task through Tasks, clear the form if it worked, redraw the cards, and show toastbanner for the result.

    const addTaskForm = document.getElementById("add-task-form");
    if (addTaskForm) {
      addTaskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // We grab each input from the add form by id. Trimming removes accidental spaces at the start or end so we do not save a blank looking title or notes.

        const titleInput = document.getElementById("task-title");
        const listInput = document.getElementById("task-list");
        const priorityInput = document.getElementById("task-priority");
        const dueDateInput = document.getElementById("task-due-date");
        const notesInput = document.getElementById("task-notes");

        // listName comes from whichever option is selected in the list dropdown
        // priority defaults to Medium so it is never blank in storage if the person skips it
        const result = await Tasks.add({
          listName: listInput ? listInput.value : UI.getActiveList(),
          title: titleInput ? titleInput.value.trim() : "",
          description: notesInput ? notesInput.value.trim() : "",
          priority: priorityInput ? priorityInput.value : "Medium",
          dueDate: dueDateInput ? dueDateInput.value : ""
        });

        // If adding fails we leave what the person typed in the form and show the error in a toast so they can fix it and try again.
        if (!result.success) {
          UI.showToast(result.message);
          return;
        }

        // If adding works we empty the text fields and set priority back to Medium so the form is ready for the next task without leftover values.
        if (titleInput) titleInput.value = "";
        if (notesInput) notesInput.value = "";
        if (dueDateInput) dueDateInput.value = "";
        if (priorityInput) priorityInput.value = "medium";

        await UI.refreshDashboard();
        UI.showToast("Task added.");
      });
    }
  }

};