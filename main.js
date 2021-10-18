// Selectors for new category form
const newCategoryForm = document.querySelector('[data-new-category-form]');
const newCategoryInput = document.querySelector('[data-new-category-input]');

// Selector for categories container
const categoriesContainer = document.querySelector('[data-categories]');

// Selector for currently viewing
const currentlyViewing = document.querySelector('[data-currently-viewing]');

// Selector for new ticket form
const newTicketForm = document.querySelector('[data-new-ticket-form]');
const newTicketSelect = document.querySelector('[data-new-ticket-select]');
const newTicketInput = document.querySelector('[data-new-ticket-input]');

// Selector for edit ticket form
const editTicketForm = document.querySelector('[data-edit-ticket-form]');
const editTicketSelect = document.querySelector('[data-edit-ticket-select]');
const editTicketInput = document.querySelector('[data-edit-ticket-input]');

// Selector for tickets container
const ticketsContainer = document.querySelector('[data-cards]');

// Local storage keys
const LOCAL_STORAGE_CATEGORIES_KEY = 'LOCAL_STORAGE_CATEGORIES_KEY';
const LOCAL_STORAGE_TICKETS_KEY = 'LOCAL_STORAGE_TICKETS_KEY';
const LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY = 'LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY';

let selectedCategoryId = localStorage.getItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY);
let categories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) || [];
let tickets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY)) || [];

// EVENT: Add Category
newCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = newCategoryInput.value;
    const isCategoryEmpty = !category || !category.trim().length;

    if (isCategoryEmpty) {
        return console.log('please enter a task');
    }

    categories.push({ _id: Date.now().toString(), category: category, color: getRandomHexColor() });

    newCategoryInput.value = '';

    saveAndRender();
});

// EVENT: Get Selected Category Id
categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'li') {
        if (!e.target.dataset.categoryId) {
            selectedCategoryId = null;
        } else {
            selectedCategoryId = e.target.dataset.categoryId;
        }

        saveAndRender();
    }
});

// EVENT: Get Selected Category Color
categoriesContainer.addEventListener('change', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const newCategoryColor = e.target.value;
        const categoryId = e.target.parentElement.dataset.categoryId;
        const categoryToEdit = categories.find((category) => category._id === categoryId);

        categoryToEdit.color = newCategoryColor;

        saveAndRender();
    }
});

// EVENT: Delete Selected Category
currentlyViewing.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'span') {
        categories = categories.filter((category) => category._id !== selectedCategoryId);

        tickets = tickets.filter((ticket) => ticket.categoryId !== selectedCategoryId);

        selectedCategoryId = null;

        saveAndRender();
    }
});

// EVENT: Add Ticket
newTicketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    tickets.push({
        _id: Date.now().toString(),
        categoryId: newTicketSelect.value,
        ticket: newTicketInput.value,
    });

    newTicketSelect.value = '';
    newTicketInput.value = '';

    saveAndRender();
});

// EVENT: Load Edit Ticket Form With Values
let ticketToEdit = null;
ticketsContainer.addEventListener('click', (e) => {
    if (e.target.classList[1] === 'fa-edit') {
        newTicketForm.style.display = 'none';
        editTicketForm.style.display = 'flex';

        ticketToEdit = tickets.find((ticket) => ticket._id === e.target.dataset.editTicket);

        editTicketSelect.value = ticketToEdit.categoryId;
        editTicketInput.value = ticketToEdit.ticket;
    }
    if (e.target.classList[1] === 'fa-trash-alt') {
        const ticketToDeleteIndex = tickets.findIndex((ticket) => ticket._id === e.target.dataset.deleteTicket);

        tickets.splice(ticketToDeleteIndex, 1);

        saveAndRender();
    }
});

// EVENT: Update The Ticket Being Edited With New Values
editTicketForm.addEventListener('submit', function (e) {
    e.preventDefault();

    ticketToEdit.categoryId = editTicketSelect.value;
    ticketToEdit.ticket = editTicketInput.value;

    editTicketForm.style.display = 'none';
    newTicketForm.style.display = 'flex';

    editTicketSelect.value = '';
    editTicketInput.value = '';

    saveAndRender();
});

// *==================== Functions ====================

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(tickets));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_CATEGORY_ID_KEY, selectedCategoryId);
}

function render() {
    clearChildElements(categoriesContainer);
    clearChildElements(newTicketSelect);
    clearChildElements(editTicketSelect);
    clearChildElements(ticketsContainer);

    renderCategories();
    renderFormOptions();
    renderTickets();

    // Set the current viewing category
    if (!selectedCategoryId || selectedCategoryId === 'null') {
        currentlyViewing.innerHTML = `You are currently viewing <strong>All Categories</strong>`;
    } else {
        const currentCategory = categories.find((category) => category._id === selectedCategoryId);
        currentlyViewing.innerHTML = `You are currently viewing <strong>${currentCategory.category}</strong> <span>(delete)</span>`;
    }
}

function renderCategories() {
    categoriesContainer.innerHTML += `<li class="sidebar-item ${selectedCategoryId === 'null' || selectedCategoryId === null ? 'active' : ''}" data-category-id="">View All</li>
	`;

    categories.forEach(({ _id, category, color }) => {
        categoriesContainer.innerHTML += ` <li class="sidebar-item ${_id === selectedCategoryId ? 'active' : ''}" data-category-id=${_id}>${category}<input class="sidebar-color" type="color" value=${color}></li>`;
    });
}

function renderFormOptions() {

    newTicketSelect.innerHTML += `<option value="">Select A Category</option>`;
    editTicketSelect.innerHTML += `<option value="">Select A Category</option>`;

    categories.forEach(({ _id, category }) => {
        newTicketSelect.innerHTML += `<option value=${_id}>${category}</option>`;
        editTicketSelect.innerHTML += `<option value=${_id}>${category}</option>`;
    });
}

function renderTickets() {
    let ticketsToRender = tickets;

    // if their is a Selected Category Id, and selected category id !== 'null then filter the tickets
    if (selectedCategoryId && selectedCategoryId !== 'null') {
        ticketsToRender = tickets.filter((ticket) => ticket.categoryId === selectedCategoryId);
    }

    // Render Tickets
    ticketsToRender.forEach(({ _id, categoryId, ticket }) => {

        // Get Complimentary categoryDetails Based On TaskId
        const { color, category } = categories.find(({ _id }) => _id === categoryId);
        const backgroundColor = convertHexToRGBA(color, 20);
        ticketsContainer.innerHTML += `
			<div class="ticket" style="border-color: ${color}">
					<div class="ticket-tag" style="background-color: ${backgroundColor}; color: ${color};">
						${category}
					</div>
					<p class="ticket-description">${ticket}</p>
					<div class="ticket-actions">
						<i class="far fa-edit" data-edit-ticket=${_id}></i>
						<i class="far fa-trash-alt" data-delete-ticket=${_id}></i>
					</div>
			</div>`;
    });
}

// HELPERS
function clearChildElements(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function convertHexToRGBA(hexCode, opacity) {
    let hex = hexCode.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
}

function getRandomHexColor() {
    var hex = (Math.round(Math.random() * 0xffffff)).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return `#${hex}`;
}

window.addEventListener('load', render);