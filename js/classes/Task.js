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
    date feature note (applies to getDaysUntilDue, getDueDateLabel, and isDueBetweenDays).
    all three were built for the upcoming tasks column and due date pills, but we decided
    not to wire any of it up to the UI. designing and connecting it properly wasnt part of
    our original proposal and would have meant scope creep, so we left the logic here for
    the post deployment backlog instead of deleting the work.
  */

  /*
    getDaysUntilDue, whole days between today and the due date.
    negative means overdue. used inside isDueBetweenDays and getDueDateLabel.
    subtracting two Date objects gives the difference in milliseconds, msPerDay
    converts that into days, Math.round avoids decimals from timezone rounding.
  */
  getDaysUntilDue() {
    const today = Task.getTodayStart();
    const due = Task.dateFromInput(this.dueDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((due - today) / msPerDay);
  }

  /*
    getDueDateLabel text for the due pill on a task card.
    Pills are the small rounded tags on the card (design name). This one shows overdue,
    due today, or due in N days. Empty string if no date or invalid stored date.
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
    Skips tasks with no date or already complete. 
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