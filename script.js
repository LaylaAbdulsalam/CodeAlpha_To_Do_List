let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("doneCount").textContent = tasks.filter(t => t.done).length;
  document.getElementById("pendingCount").textContent = tasks.filter(t => !t.done).length;
}

function addTask() {
  const desc = document.getElementById("taskInput").value.trim();
  const category = document.getElementById("categoryInput").value;
  const priority = document.getElementById("priorityInput").value;
  const deadline = document.getElementById("deadlineInput").value;

  if (!desc) return alert("Please enter a task.");

  const task = {
    id: Date.now(),
    desc,
    category,
    priority,
    deadline,
    done: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  document.getElementById("taskInput").value = "";
  document.getElementById("deadlineInput").value = "";
}

function renderTasks(filterStatus = "all", filterCategory = "all") {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  updateStats();

  let filtered = tasks.filter(t => {
    return (filterStatus === "all" || (filterStatus === "done" && t.done) || (filterStatus === "pending" && !t.done)) &&
      (filterCategory === "all" || t.category === filterCategory);
  });

  for (let task of filtered) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const info = document.createElement("div");
    info.className = "task-info";
    info.innerHTML = `
      <span>${task.desc}</span>
      <span>Category: ${task.category} | Deadline: ${task.deadline}</span>
      <span class="priority-${task.priority}">Priority: ${task.priority}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.done ? "Undo" : "Done";
    doneBtn.className = "done-btn";
    doneBtn.onclick = () => {
      task.done = !task.done;
      saveTasks();
      renderTasks(filterStatus, filterCategory);
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editTask(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks(filterStatus, filterCategory);
    };

    actions.append(doneBtn, editBtn, deleteBtn);
    li.append(info, actions);
    list.appendChild(li);
  }
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newDesc = prompt("Edit description:", task.desc);
  if (newDesc !== null) {
    task.desc = newDesc.trim();
    saveTasks();
    renderTasks();
  }
}

function filterTasks() {
  const status = document.getElementById("filterStatus").value;
  const category = document.getElementById("filterCategory").value;
  renderTasks(status, category);
}

document.getElementById("addTaskBtn").addEventListener("click", addTask);

renderTasks();



// Drag and Drop
let draggedTaskId = null;

function makeDraggable() {
  const items = document.querySelectorAll(".task-item");
  items.forEach(item => {
    item.setAttribute("draggable", true);
    item.ondragstart = (e) => {
      draggedTaskId = e.target.querySelector("button").dataset.id;
      e.dataTransfer.effectAllowed = "move";
    };
    item.ondragover = (e) => e.preventDefault();
    item.ondrop = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.querySelector("button").dataset.id;
      reorderTasks(draggedTaskId, targetId);
    };
  });
}

function reorderTasks(fromId, toId) {
  const fromIndex = tasks.findIndex(t => t.id == fromId);
  const toIndex = tasks.findIndex(t => t.id == toId);
  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, moved);
  saveTasks();
  renderTasks();
}

// Notification
function notifyTaskAdded(task) {
  if (Notification.permission === "granted") {
    new Notification("Task Added", {
      body: `${task.desc} - Due: ${task.deadline}`,
      icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
    });
  }
}

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Modify addTask to call notify
const originalAddTask = addTask;
addTask = function () {
  const desc = document.getElementById("taskInput").value.trim();
  const deadline = document.getElementById("deadlineInput").value;
  if (!desc) return alert("Please enter a task.");

  const category = document.getElementById("categoryInput").value;
  const priority = document.getElementById("priorityInput").value;

  const task = {
    id: Date.now(),
    desc,
    category,
    priority,
    deadline,
    done: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  notifyTaskAdded(task);
  document.getElementById("taskInput").value = "";
  document.getElementById("deadlineInput").value = "";
};
