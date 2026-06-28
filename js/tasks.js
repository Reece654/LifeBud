/*
  tasks.js
  handles all task operations, create, read, update and delete using Supabase.
  all functions are async as they wait for a response from Supabase.
*/

const Tasks = {

  // gets all tasks for the logged in user from Supabase
  getAll: async function () {

    // relies entirely on RLS to scope rows to this user, no user_id filter on the query itself.
    // RLS being disabled is exactly what caused the cross-user task leak earlier in testing
    const result = await supabaseClient
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (result.error) return [];

    // maps the Supabase data into Task objects so the rest of the app can use them
    return result.data.map(function (row) {
      return new Task({
        id: row.id,
        listName: row.listName,
        title: row.title,
        description: row.description,
        priority: row.priority,
        dueDate: row.dueDate,
        isComplete: row.is_complete,
        createdAt: row.created_at
      });
    });
  },

  // filters here in js instead of in the supabase query so this can just reuse getAll().
  // means it fetches every task first then throws away ones not in this list.
  getByList: async function (listName) {

    // gets all tasks then filters by list name
    const tasks = await this.getAll();
    return tasks.filter(function (task) {
      return task.listName === listName;
    });
  },

  // adds a new task to Supabase
  add: async function (taskData) {

    // title validation, checks its not empty before doing anything
    if (!taskData.title || taskData.title.trim() === "") {
      return { success: false, message: "Please enter a task title." };
    }

    // removes extra spaces and use General if nothing was typed
    const cleanListName = taskData.listName ? taskData.listName.trim() : "";
    const listName = cleanListName === "" ? "General" : cleanListName;

    // grabs the logged in users id straight from the session here instead of a separate variable.
    // this nested await is messy and is on the list to clean up in the tasks.js and lists.js refactor pass.
    const result = await supabaseClient
      .from("tasks")
      .insert({
        user_id: (await supabaseClient.auth.getSession()).data.session.user.id,
        title: taskData.title.trim(),
        listName: listName,
        description: taskData.description || "",
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate || null,
        is_complete: false
      })
      .select()
      .single();

    if (result.error) return { success: false, message: result.error.message };

    // returns the new task as a Task object
    return {
      success: true,
      task: new Task({
        id: result.data.id,
        listName: result.data.listName,
        title: result.data.title,
        description: result.data.description,
        priority: result.data.priority,
        dueDate: result.data.dueDate,
        isComplete: result.data.is_complete,
        createdAt: result.data.created_at
      })
    };
  },

  // updates an existing task in Supabase
  update: async function (taskId, updates) {

    // listname check, removes extra spaces and uses General if nothing was typed
    const cleanListName = updates.listName ? updates.listName.trim() : "";
    const listName = cleanListName === "" ? "General" : cleanListName;

    // sends the updated fields to Supabase and waits for a response
    // only matches by taskId here, no user_id check in this query.
    // relies entirely on RLS to block updates to tasks that arent this users.
    const result = await supabaseClient
      .from("tasks")
      .update({
        title: updates.title,
        listName: listName,
        description: updates.description || "",
        priority: updates.priority || "medium",
        dueDate: updates.dueDate || null,
        is_complete: updates.isComplete || false
      })
      .eq("id", taskId)
      .select()
      .single();

    if (result.error) return { success: false, message: result.error.message };

    // returns the updated task as a Task object
    return {
      success: true,
      task: new Task({
        id: result.data.id,
        listName: result.data.listName,
        title: result.data.title,
        description: result.data.description,
        priority: result.data.priority,
        dueDate: result.data.dueDate,
        isComplete: result.data.is_complete,
        createdAt: result.data.created_at
      })
    };
  },

  // removes a task from Supabase
  remove: async function (taskId) {

    // sends the delete request to Supabase and waits for a response
    // relies entirely on RLS to block the deletion of tasks that arent this users.
    const result = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (result.error) return { success: false, message: result.error.message };

    // all good, tells the UI the task was removed
    return { success: true };
  },

  // opens a realtime channel and listens for changes to the tasks table
  // whenever a task is added, edited, or deleted anywhere, we refresh the dashboard
  // so it shows up straight away without the person needing to refresh the page
  subscribeToChanges: function () {

    const channel = supabaseClient
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        function (payload) {
          console.log("realtime change received:", payload);
          UI.refreshDashboard();
        }
      )
      .subscribe();

    return channel;
  }

};