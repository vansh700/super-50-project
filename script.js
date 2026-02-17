const API_URL = "http://localhost:5001/api/customers";

// Get DOM Elements
const customerNameInput = document.getElementById("customer-name");
const customerGenderInput = document.getElementById("customer-gender");
const customerPhoneInput = document.getElementById("customer-phone");
const purchaseItemInput = document.getElementById("purchase-item");
const purchaseDateInput = document.getElementById("purchase-date");
const itemPriceInput = document.getElementById("item-price");
const searchInput = document.getElementById("search");
const addCustomerBtn = document.getElementById("add-customer-btn");
const customerTableBody = document.querySelector("#customer-table tbody");

// New fields
const customerEmailInput = document.getElementById("customer-email");
const customerAddressInput = document.getElementById("customer-address");
const itemWeightInput = document.getElementById("item-weight");
const customerIDInput = document.getElementById("customer-id");
const paymentMethodInput = document.getElementById("payment-method");
const customerNotesInput = document.getElementById("customer-notes");

// Load initial customers
window.addEventListener("DOMContentLoaded", loadCustomers);

// Add Customer Record
addCustomerBtn.addEventListener("click", async () => {
  const customerData = {
    name: customerNameInput.value.trim(),
    gender: customerGenderInput.value,
    phone: customerPhoneInput.value.trim(),
    email: customerEmailInput.value.trim(),
    address: customerAddressInput.value.trim(),
    item: purchaseItemInput.value.trim(),
    weight: parseFloat(itemWeightInput.value),
    idproof: customerIDInput.value.trim(),
    date: purchaseDateInput.value,
    price: parseFloat(itemPriceInput.value),
    payment: paymentMethodInput.value,
    notes: customerNotesInput.value.trim()
  };

  if (!customerData.name || !customerData.phone || !customerData.item || !customerData.date || isNaN(customerData.price)) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    // Clear inputs
    customerNameInput.value = "";
    customerGenderInput.value = "Male";
    customerPhoneInput.value = "";
    customerEmailInput.value = "";
    customerAddressInput.value = "";
    purchaseItemInput.value = "";
    itemWeightInput.value = "";
    customerIDInput.value = "";
    purchaseDateInput.value = "";
    itemPriceInput.value = "";
    paymentMethodInput.value = "Cash";
    customerNotesInput.value = "";

    await loadCustomers();
  } catch (error) {
    console.error("Add customer error:", error);
    alert(`Error: ${error.message}`);
  }
});

// Search Functionality
searchInput.addEventListener("input", async () => {
  try {
    const response = await fetch(`${API_URL}/search?term=${encodeURIComponent(searchInput.value.trim())}`);
    const customers = await response.json();
    updateTable(customers);
  } catch (error) {
    console.error("Search error:", error);
  }
});

// Load customers
async function loadCustomers() {
  try {
    const response = await fetch(API_URL);
    const customers = await response.json();
    updateTable(customers);
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

// Update table
function updateTable(customers) {
  customerTableBody.innerHTML = "";
  customers.forEach(customer => {
    const price = parseFloat(customer.price);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${customer.name}</td>
      <td>${customer.gender}</td>
      <td>${customer.phone}</td>
      <td>${customer.item}</td>
      <td>${customer.weight || "-"}</td>
      <td>${new Date(customer.date).toLocaleDateString()}</td>
      <td>₹${isNaN(price) ? "0.00" : price.toFixed(2)}</td>
    `;
    customerTableBody.appendChild(row);

  });
  // Export table data to CSV
const exportCsvBtn = document.getElementById("export-csv-btn");

exportCsvBtn.addEventListener("click", () => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Get table headers
  const headers = Array.from(document.querySelectorAll("#customer-table th"))
                       .map(th => th.textContent.trim())
                       .join(",");
  csvContent += headers + "\r\n";

  // Get table rows
  const rows = Array.from(document.querySelectorAll("#customer-table tbody tr"));
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll("td"))
                      .map(td => `"${td.textContent.trim()}"`) // add quotes to handle commas
                      .join(",");
    csvContent += cols + "\r\n";
  });

  // Encode and download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "customers.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

}
