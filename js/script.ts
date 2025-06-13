interface TodoItem {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

// DOM Elements
const titleInput = document.getElementById("title") as HTMLInputElement | null;
const descriptionInput = document.getElementById("description") as HTMLTextAreaElement | null;
const addButton = document.getElementById("addBtn") as HTMLButtonElement | null;
const updateButton = document.getElementById("updateBtn") as HTMLButtonElement | null;
const todoListContainer = document.getElementById("todoListContainer") as HTMLDivElement | null;

let todoList: TodoItem[] = getStoredTodos();
let currentEditId: number | null = null;

// Initial Render
renderTodoList();

// Event Listeners
addButton?.addEventListener("click", handleAddTodo);
updateButton?.addEventListener("click", handleUpdateTodo);

function getStoredTodos(): TodoItem[] {
    const stored = localStorage.getItem("todoList");
    return stored ? JSON.parse(stored) : [];
}

function saveTodos(): void {
    localStorage.setItem("todoList", JSON.stringify(todoList));
}

const regex = {
    title: {
        pattern: /^[a-zA-Z0-9\s]{1,50}$/,
        isValid: false
    },
    description: {
        pattern: /^[a-zA-Z0-9\s.,!?]{1,200}$/,
        isValid: false
    }
};

function validateInput(element: HTMLInputElement | HTMLTextAreaElement) {
    const value = element.value.trim();
    const isValid = regex[element.id as keyof typeof regex].pattern.test(value);

    if (isValid) {
        element.classList.remove("is-invalid");
        element.classList.add("is-valid");
        element.nextElementSibling?.classList.add("d-none");
        regex[element.id as keyof typeof regex].isValid = true;
    } else {
        element.classList.remove("is-valid");
        element.classList.add("is-invalid");
        element.nextElementSibling?.classList.remove("d-none");
        regex[element.id as keyof typeof regex].isValid = false;
    }

    toggleFormButtonStates();
}

function toggleFormButtonStates() {
    const isFormValid = regex.title.isValid && regex.description.isValid;

    if (addButton) addButton.disabled = !isFormValid;
    if (updateButton && !updateButton.classList.contains("d-none")) {
        updateButton.disabled = !isFormValid;
    }
}

function handleAddTodo(): void {
    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";

    const newTodo: TodoItem = {
        id: Date.now(),
        title,
        description,
        completed: false
    };

    todoList.push(newTodo);
    saveTodos();
    resetForm();
    renderTodoList();

    if (addButton) addButton.disabled = true;
}

function handleUpdateTodo(): void {
    if (currentEditId === null) return;

    const title = titleInput?.value.trim() ?? "";
    const description = descriptionInput?.value.trim() ?? "";

    if (!title) return alert("Title is required.");

    const todo = todoList.find(t => t.id === currentEditId);
    if (!todo) return;

    todo.title = title;
    todo.description = description;

    saveTodos();
    resetForm();
    renderTodoList();
}

function resetForm(): void {
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

function renderTodoList(): void {
    if (!todoListContainer) return;

    todoListContainer.innerHTML = "";

    todoList.forEach(todo => {
        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center border px-4 py-3 mb-4 rounded";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = todo.title;
        titleSpan.className = todo.completed ? "text-decoration-line-through text-muted" : "";

        const iconsDiv = document.createElement("div");
        iconsDiv.appendChild(createButton("✔", "success", () => toggleCompleted(todo.id)));
        iconsDiv.appendChild(createButton("✏️", "warning", () => prepareEdit(todo.id)));
        iconsDiv.appendChild(createButton("🗑️", "danger", () => deleteTodo(todo.id)));

        row.append(titleSpan, iconsDiv);
        todoListContainer.appendChild(row);
    });
}

function createButton(label: string, type: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `btn btn-${type} btn-sm me-2`;
    button.innerHTML = label;
    button.onclick = onClick;
    return button;
}

function toggleCompleted(id: number): void {
    const todo = todoList.find(t => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    saveTodos();
    renderTodoList();
}

function prepareEdit(id: number): void {
    const todo = todoList.find(t => t.id === id);
    if (!todo) return;

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

function deleteTodo(id: number): void {
    todoList = todoList.filter(t => t.id !== id);
    saveTodos();
    renderTodoList();
}
