// Type definition for a single to-do item
interface TodoItem {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

// Get DOM elements
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const descriptionInput = document.getElementById("description") as HTMLTextAreaElement | null;
const addButton = document.getElementById("addBtn") as HTMLButtonElement | null;
const updateButton = document.getElementById("updateBtn") as HTMLButtonElement | null;
const todoListContainer = document.getElementById("todoListContainer") as HTMLDivElement | null;

// Retrieve existing to-do list or initialize a new one
let todoList: TodoItem[] = [];
const storedTodos = localStorage.getItem("todoList");
if (storedTodos) {
    todoList = JSON.parse(storedTodos);
    displayTodoList(todoList);
}

// Add event listener for add button
addButton?.addEventListener("click", handleAddTodo);
// Add event listener for update button
updateButton?.addEventListener("click", handleUpdateTodo);

// Function to add a new todo item
function handleAddTodo(): void {
    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";

    if (!title) {
        alert("Title is required.");
        return;
    }

    const newTodo: TodoItem = {
        id: todoList.length,
        title,
        description,
        completed: false
    };

    todoList.push(newTodo);
    localStorage.setItem("todoList", JSON.stringify(todoList));

    // Reset input fields
    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";

    // Display updated todo list
    displayTodoList(todoList);
}

function displayTodoList(todos: TodoItem[]): void {
    if (!todoListContainer) return;

    // Clear existing content
    todoListContainer.innerHTML = "";

    // Render each todo item
    todos.forEach((todo, index) => {
        const todoRow = document.createElement("div");
        todoRow.className = "d-flex justify-content-between align-items-center border px-4 py-3 mb-4 rounded";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = todo.title;
        titleSpan.className = todo.completed ? "text-decoration-line-through text-muted" : "";

        const iconsDiv = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.className = "btn btn-success btn-sm me-2";
        doneBtn.innerHTML = "✔";
        doneBtn.title = "Mark as done";
        doneBtn.onclick = () => toggleDone(index);

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-warning btn-sm me-2";
        editBtn.innerHTML = "✏️";
        editBtn.title = "Edit";
        editBtn.onclick = () => editTodo(index);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.title = "Delete";
        deleteBtn.onclick = () => deleteTodo(index);

        iconsDiv.append(doneBtn, editBtn, deleteBtn);
        todoRow.append(titleSpan, iconsDiv);
        
        todoListContainer.appendChild(todoRow);
    });
}

// Function to delete a todo item
function deleteTodo(index: number): void {
    todoList.splice(index, 1);
    localStorage.setItem("todoList", JSON.stringify(todoList));
    displayTodoList(todoList);
}

function toggleDone(index: number): any {
    todoList[index].completed = !todoList[index].completed;
    localStorage.setItem("todoList", JSON.stringify(todoList));
    displayTodoList(todoList);
}

let currentIndex = 0;

function editTodo(index: number): any {
    if (titleInput) titleInput.value = todoList[index].title;
    if (descriptionInput) descriptionInput.value = todoList[index].description;
    addButton?.classList.add("d-none");
    updateButton?.classList.remove("d-none");
    currentIndex = index;
}

function handleUpdateTodo(): void {
    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";

    if (!title) {
        alert("Title is required.");
        return;
    }

    // Update the todo item
    todoList[currentIndex].title = title;
    todoList[currentIndex].description = description;
    localStorage.setItem("todoList", JSON.stringify(todoList));

    // Reset input fields
    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";

    // Hide update button and show add button
    addButton?.classList.remove("d-none");
    updateButton?.classList.add("d-none");

    // Display updated todo list
    displayTodoList(todoList);
}

