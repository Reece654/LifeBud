/*
  Task.js
  Our model class for one to-do item. Matches the fields on the add/edit forms in app.html.
  We put date maths here (getDaysUntilDue, getDueDateLabel, isDueBetweenDays) so ui.js
  and TaskService never calculate dates or due wording differently on task cards and upcoming.
*/

class Task {
  constructor({
    id,
    listName = "Work",
    title = "",
    description = "",
    priority = "Medium",
    dueDate = "",
    isComplete = false,
    createdAt = new Date().toISOString()
  }) {
    this.id = id || Task.createId();
    this.listName = listName;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.dueDate = dueDate;
    this.isComplete = isComplete;
    this.createdAt = createdAt;
  }

  static createId() {
    return "task_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  }

  static getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  static dateFromInput(dateString) {
    const parts = dateString.split("-");
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /*
    We needed something to calculate the number of days between a task's due date and
    today, ready for the upcoming tasks, due date label, and completed tasks systems we
    plan to implement post deployment, or earlier if there is time. We wanted this built
    now to save time and troubleshooting down the road.

    This was a calculation we hadn't needed to use in some time. We remembered using
    something similar in a prototype we developed for a previous client outside of our
    course related projects and recalled there being good resources on GeeksforGeeks.org.
    We found their article "How to Calculate the Number of Days between Two Dates in
    JavaScript" and used it to help structure this code.

    From that we learned that subtracting two Date objects in JavaScript returns the
    difference in milliseconds. We then built msPerDay (1000 * 60 * 60 * 24) based on
    their example to convert those milliseconds into whole days, and used Math.round()
    to avoid decimal results caused by small timezone or clock differences.

    getDaysUntilDue returns whole days between today and the due date.
    Negative means overdue. Used inside isDueBetweenDays and getDueDateLabel.
  */
  getDaysUntilDue() {
    const today = Task.getTodayStart();
    const due = Task.dateFromInput(this.dueDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((due - today) / msPerDay);
  }

  /*
    getDueDateLabel text for the due pill on a task card.
    This one shows overdue, due today, or due in N days. Empty string if no date or invalid stored date.

    This method is built and ready but is not connected to the UI yet. We made a deliberate
    decision to keep the launch application simple (KISS) and ship the task cards working with the
    raw date string first rather than delay the release to wire in the label logic. Once the
    app is live we plan to replace the raw date in makeTaskCard() in ui.js with a call to
    getDueDateLabel() so the due date pill shows friendlier text. We will do this at the same
    time as the completed tasks and upcoming tasks features since all three depend on this
    same method.
  */
  getDueDateLabel() {
    if (!this.dueDate) {
      return "";
    }

    const daysUntil = this.getDaysUntilDue();

    if (Number.isNaN(daysUntil)) {
      return "";
    }

    if (daysUntil < 0) {
      const daysOverdue = Math.abs(daysUntil);
      if (daysOverdue === 1) {
        return "Overdue by 1 day";
      }
      return "Overdue by " + daysOverdue + " days";
    }

    if (daysUntil === 0) {
      return "Due today";
    }

    if (daysUntil === 1) {
      return "Due in 1 day";
    }

    return "Due in " + daysUntil + " days";
  }

  /*
    isDueBetweenDays decides if a task appears in the upcoming column (1 to 3 days).
    Skips tasks with no date or already complete. Complete UI comes in a later sprint.
  */
  isDueBetweenDays(minDays, maxDays) {
    if (!this.dueDate || this.isComplete) {
      return false;
    }

    const daysUntil = this.getDaysUntilDue();
    return daysUntil >= minDays && daysUntil <= maxDays;
  }

  toJSON() {
    return {
      id: this.id,
      listName: this.listName,
      title: this.title,
      description: this.description,
      priority: this.priority,
      dueDate: this.dueDate,
      isComplete: this.isComplete,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    return new Task(data);
  }
}