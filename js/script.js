"use strict";
// === DOM Element References ===
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const addButton = document.getElementById("addBtn");
const updateButton = document.getElementById("updateBtn");
const todoListContainer = document.getElementById("todoListContainer");
// === App State ===
let todoList = getStoredTodos(); // Load from localStorage
let currentEditId = null; // For tracking item being edited
// === Validation Rules ===
const regex = {
    title: {
        pattern: /^[a-zA-Z][a-zA-Z0-9\s]{0,49}$/,
        isValid: false,
        errorMessage: "Title must start with a letter and be 1-50 characters long. Only letters, numbers, and spaces are allowed."
    },
    description: {
        pattern: /^[a-zA-Z][a-zA-Z0-9\s.,!?]{0,199}$/,
        isValid: false,
        errorMessage: "Description must start with a letter and be 1-200 characters long. Only letters, numbers, spaces, and . , ! ? are allowed."
    }
};
// === Initial Render ===
renderTodoList();
// === Event Listeners ===
addButton?.addEventListener("click", handleAddTodo);
updateButton?.addEventListener("click", handleUpdateTodo);
// === Load Todos from Local Storage ===
function getStoredTodos() {
    const stored = localStorage.getItem("todoList");
    return stored ? JSON.parse(stored) : [];
}
// === Save Todos to Local Storage ===
function saveTodos() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
}
// === Input Validation Handler ===
function validateInput(element) {
    const field = element.id;
    const { pattern, errorMessage } = regex[field];
    const value = element.value.trim();
    const isValid = pattern.test(value);
    const alertDiv = element.nextElementSibling;
    if (isValid) {
        element.classList.remove("is-invalid");
        element.classList.add("is-valid");
        alertDiv.classList.add("d-none");
    }
    else {
        element.classList.remove("is-valid");
        element.classList.add("is-invalid");
        alertDiv.classList.remove("d-none");
        const msg = alertDiv.querySelector("small");
        if (msg)
            msg.textContent = errorMessage;
    }
    regex[field].isValid = isValid;
    toggleFormButtonStates();
}
// === Enable/Disable Add or Update Button ===
function toggleFormButtonStates() {
    const isFormValid = regex.title.isValid && regex.description.isValid;
    if (addButton)
        addButton.disabled = !isFormValid;
    if (updateButton && !updateButton.classList.contains("d-none")) {
        updateButton.disabled = !isFormValid;
    }
}
// === Add New Todo ===
function handleAddTodo() {
    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";
    const newTodo = {
        id: Date.now(),
        title,
        description,
        completed: false
    };
    todoList.push(newTodo);
    saveTodos();
    resetForm();
    renderTodoList();
    if (addButton)
        addButton.disabled = true;
}
// === Update Existing Todo ===
function handleUpdateTodo() {
    if (currentEditId === null)
        return;
    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";
    const todo = todoList.find(t => t.id === currentEditId);
    if (!todo)
        return;
    todo.title = title;
    todo.description = description;
    saveTodos();
    resetForm();
    renderTodoList();
}
// === Reset Form After Add/Update ===
function resetForm() {
    if (titleInput) {
        titleInput.value = "";
        titleInput.classList.remove("is-valid", "is-invalid");
        regex.title.isValid = false;
    }
    if (descriptionInput) {
        descriptionInput.value = "";
        descriptionInput.classList.remove("is-valid", "is-invalid");
        regex.description.isValid = false;
    }
    addButton?.classList.remove("d-none");
    updateButton?.classList.add("d-none");
    currentEditId = null;
    toggleFormButtonStates();
}
// === Render Todo List to the Page ===
function renderTodoList() {
    if (!todoListContainer)
        return;
    todoListContainer.innerHTML = "";
    if (todoList.length === 0) {
        // UX: Message when no items exist
        const emptyMsg = document.createElement("div");
        emptyMsg.className = "text-center text-secondary fs-5 py-5";
        emptyMsg.innerHTML = `<i class="fas fa-inbox fa-2x mb-3 d-block"></i>No tasks found. Add a new one above.`;
        todoListContainer.appendChild(emptyMsg);
        return;
    }
    todoList.forEach(todo => {
        const row = document.createElement("div");
        row.className = "todo-row border px-4 py-3 mb-4 rounded d-flex flex-row justify-content-between align-items-center gap-3";
        if (todo.completed) {
            row.classList.add("bg-success", "bg-opacity-50", "strike-black");
        }
        const titleSpan = document.createElement("span");
        titleSpan.textContent = todo.title;
        titleSpan.className = "fw-semibold fs-5";
        const iconsDiv = document.createElement("div");
        iconsDiv.className = "d-flex flex-wrap gap-2";
        iconsDiv.appendChild(createIconButton("fas fa-check", "success", () => toggleCompleted(todo.id)));
        iconsDiv.appendChild(createIconButton("fas fa-edit", "warning", () => prepareEdit(todo.id), todo.completed));
        iconsDiv.appendChild(createIconButton("fas fa-trash", "danger", () => deleteTodo(todo.id)));
        row.append(titleSpan, iconsDiv);
        todoListContainer.appendChild(row);
    });
}
// === Create Reusable Icon Button ===
function createIconButton(iconClass, type, onClick, disabled = false) {
    const button = document.createElement("button");
    button.className = `btn btn-${type} btn-sm me-2`;
    button.disabled = disabled;
    const icon = document.createElement("i");
    icon.className = iconClass;
    button.appendChild(icon);
    button.onclick = onClick;
    return button;
}
// === Toggle Completion Status ===
function toggleCompleted(id) {
    const todo = todoList.find(t => t.id === id);
    if (!todo)
        return;
    todo.completed = !todo.completed;
    saveTodos();
    renderTodoList();
}
// === Prepare Form for Editing Existing Todo ===
function prepareEdit(id) {
    const todo = todoList.find(t => t.id === id);
    if (!todo)
        return;
    if (titleInput) {
        titleInput.value = todo.title;
        validateInput(titleInput);
    }
    if (descriptionInput) {
        descriptionInput.value = todo.description;
        validateInput(descriptionInput);
    }
    currentEditId = id;
    addButton?.classList.add("d-none");
    updateButton?.classList.remove("d-none");
    toggleFormButtonStates();
}
// === Delete Todo by ID ===
function deleteTodo(id) {
    todoList = todoList.filter(t => t.id !== id);
    saveTodos();
    resetForm();
    renderTodoList();
}
