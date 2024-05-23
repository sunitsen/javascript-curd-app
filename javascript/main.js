const form = document.getElementById("curdForm");
const fullname = form.querySelector("#full-name");
const email = form.querySelector("#email");
const password = form.querySelector("#password");
const state = form.querySelector("#state");
const submitButton = form.querySelector("button[type='submit']");

let isEditing = false;
let editingUserId = null;

// Define the order of columns
const columns = ["id", "fullName", "email", "password", "state"];

// Pagination variables
let currentPage = 1;
const rowsPerPage = 10;
const maxPageButtons = 10;

const updateTable = (data, currentPage = 1, rowsPerPage = 10) => {
  const tableHead = document.getElementById("table").getElementsByTagName("thead")[0];
  const tableBody = document.getElementById("table").getElementsByTagName("tbody")[0];

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    const messageRow = document.createElement("tr");
    const messageCell = document.createElement("td");
    messageCell.classList.add("entry-text");
    messageCell.textContent = "No entries found";
    messageCell.colSpan = columns.length + 1; // Adjust colSpan to match the number of columns + actions column
    messageRow.appendChild(messageCell);
    tableBody.appendChild(messageRow);
    return;
  }

  const headerRow = document.createElement("tr");
  columns.forEach((key) => {
    const tableHeader = document.createElement("th");
    tableHeader.textContent = key;
    headerRow.appendChild(tableHeader);
  });

  const buttonHeader = document.createElement("th");
  buttonHeader.textContent = "Actions";
  headerRow.appendChild(buttonHeader);
  tableHead.appendChild(headerRow);

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  paginatedData.forEach((item) => {
    const tableRow = document.createElement("tr");
    
    columns.forEach((key) => {
      const tableCell = document.createElement("td");
      tableCell.classList.add("custom-padding", "value-text");
      tableCell.textContent = item[key];
      tableRow.appendChild(tableCell);
    });

    const buttonCellEdit = document.createElement("td");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    editButton.textContent = "Edit";
    deleteButton.textContent = "Delete";

    editButton.classList.add("edit-button");
    deleteButton.classList.add("delete-button");

    editButton.dataset.id = item.id;
    deleteButton.dataset.id = item.id;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    buttonCellEdit.appendChild(buttonContainer);
    tableRow.appendChild(buttonCellEdit);
    tableBody.appendChild(tableRow);
  });

  // Create pagination controls
  const paginationControls = document.getElementById("pagination-controls");
  paginationControls.innerHTML = "";

  const totalPages = Math.ceil(data.length / rowsPerPage);
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage < maxPageButtons - 1) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  const createPageButton = (page, isCurrent = false) => {
    const pageButton = document.createElement("button");
    pageButton.textContent = page;
    pageButton.classList.add("page-button");
    if (isCurrent) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", () => {
      updateTable(data, page, rowsPerPage);
    });
    return pageButton;
  };

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.classList.add("page-button");
    prevButton.addEventListener("click", () => {
      updateTable(data, currentPage - 1, rowsPerPage);
    });
    paginationControls.appendChild(prevButton);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationControls.appendChild(createPageButton(i, i === currentPage));
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.classList.add("page-button");
    nextButton.addEventListener("click", () => {
      updateTable(data, currentPage + 1, rowsPerPage);
    });
    paginationControls.appendChild(nextButton);
  }

  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-button')) {
      const id = parseInt(event.target.dataset.id);
      const userData = getData().find(item => item.id === id);
      fullname.value = userData.fullName;
      email.value = userData.email;
      password.value = userData.password;
      state.value = userData.state;
      isEditing = true;
      editingUserId = id;
      submitButton.textContent = "Update";
    } else if (event.target.classList.contains('delete-button')) {
      const id = parseInt(event.target.dataset.id);
      const data = getData().filter(item => item.id !== id);
      localStorage.setItem('userInfo', JSON.stringify(data));
      updateTable(data, currentPage, rowsPerPage);
    }
  });
};

const getData = () => {
  let originalData = localStorage.getItem("userInfo");
  try {
    originalData = originalData ? JSON.parse(originalData) : [];
    if (!Array.isArray(originalData)) {
      originalData = [];
    }
  } catch (e) {
    console.error("Error parsing userInfo from localStorage", e);
    originalData = [];
  }
  return originalData;
}

const storeData = (userData) => {
  const originalData = getData();
  if (isEditing) {
    const index = originalData.findIndex(item => item.id === editingUserId);
    if (index !== -1) {
      originalData[index] = { id: editingUserId, ...userData };
    }
    isEditing = false;
    editingUserId = null;
    submitButton.textContent = "Submit";
  } else {
    userData.id = originalData.length ? originalData[originalData.length - 1].id + 1 : 1;
    originalData.push(userData);
  }
  localStorage.setItem("userInfo", JSON.stringify(originalData));
  updateTable(originalData, currentPage, rowsPerPage);
}

const showErrorMessage = (key) => {
  let errorTag = document.getElementById(`${key}-error`);
  if (errorTag) {
    errorTag.classList.add("danger");
    errorTag.innerHTML = `${key} is required`;
  }
}

const removeErrorMessage = (key) => {
  let errorTag = document.getElementById(`${key}-error`);
  if (errorTag) {
    errorTag.innerHTML = '';
  }
}

const formValidation = (data) => {
  let isValid = true;
  Object.entries(data).forEach(([key, value]) => {
    if (!value) {
      showErrorMessage(key);
      isValid = false;
    } else {
      removeErrorMessage(key);
    }
  });
  return isValid;
}

const handleFormSubmit = (e) => {
  e.preventDefault();
  const userInfo = {
    fullName: fullname.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    state: state.value.trim(),
  };

  if (!formValidation(userInfo)) {
  } else {
    storeData(userInfo);
    form.reset()
  }
};

// Submit form
form.addEventListener("submit", handleFormSubmit);

// Initial table update
updateTable(getData(), currentPage, rowsPerPage);
