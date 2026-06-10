/*
  tasks.js
  handles all task operations, create, read, update and delete using Supabase.
  all functions are async as they wait for a response from Supabase.
*/

const Tasks = {

  // gets all tasks for the logged in user from Supabase
  getAll: async function () {

    // asks Supabase for all tasks belonging to the current user
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

  // gets all tasks for a specific list
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

    // sends the new task to Supabase and waits for a response
    const result = await supabaseClient
      .from("tasks")
      .insert({
        user_id: (await supabaseClient.auth.getSession()).data.session.user.id,
        title: taskData.title.trim(),
        listName: taskData.listName,
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

    // sends the updated fields to Supabase and waits for a response
    const result = await supabaseClient
      .from("tasks")
      .update({
        title: updates.title,
        listName: updates.listName,
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
    const result = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (result.error) return { success: false, message: result.error.message };

    // all good, tells the UI the task was removed
    return { success: true };
  }

};