/*
  lists.js
  handles list operations, gets all lists and adds a new list, using Supabase.
  all functions are async as they wait for a response from Supabase.
*/

const Lists = {

  // gets all lists for the logged in user from Supabase
  // relies entirely on RLS to scope rows to this user, no user_id filter on the query itself
  // RLS being disabled is exactly what caused the cross-user task leak earlier in testing
  getAll: async function () {

    // asks Supabase for all lists belonging to the current user
    const result = await supabaseClient
      .from("lists")
      .select("*")
      .order("created_at", { ascending: true });

    if (result.error) return [];

    // returns just the list names as a plain array of strings
    return result.data.map(function (row) {
      return row.name;
    });
  },

  // adds a new list to Supabase
  add: async function (name) {

    // name validation, checks its not empty before doing anything
    if (!name || name.trim() === "") {
      return { success: false, message: "Please enter a list name." };
    }

    // trims once here so the same cleaned up value gets used below for both the duplicate check and the actual insert
    const cleanName = name.trim();

    // gets every list this user already has so we can check for a clash before adding
    const existingLists = await Lists.getAll();

    // some returns true the moment it finds one match, toLowerCase on both sides means Work and work count as the same list
    const alreadyExists = existingLists.some(function (existingName) {
      return existingName.toLowerCase() === cleanName.toLowerCase();
    });

    // stops here if a matching list already exists, nothing gets sent to Supabase
    if (alreadyExists) {
      return { success: false, message: "A list with that name already exists." };
    }

    // sends the new list to Supabase and waits for a response
    const result = await supabaseClient
      .from("lists")
      .insert({
        user_id: (await supabaseClient.auth.getSession()).data.session.user.id,
        name: cleanName
      })
      .select()
      .single();

    if (result.error) return { success: false, message: result.error.message };

    // returns the new list name
    return { success: true, name: result.data.name };
  },

  // opens a realtime channel and listens for changes to the lists table
  // whenever a list is added, edited, or deleted anywhere, we rebuild the sidebar and dropdowns
  // so it shows up straight away without the person needing to refresh the page
  subscribeToChanges: function () {

    const channel = supabaseClient
      .channel("lists-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lists" },
        function (payload) {
          console.log("realtime list change received:", payload);
          UI.fillListButtons();
          UI.fillListDropdown();
        }
      )
      .subscribe();

    return channel;
  }

};