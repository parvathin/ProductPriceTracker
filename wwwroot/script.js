// Global storage for alerts
let alerts = [];

// Fetch products from FakeStore API and populate in the dropdown
async function loadProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products");
        const products = await response.json();
        const productSelect = document.getElementById("productSelect");
        productSelect.innerHTML = ""; 
        products.forEach((product) => {
            const option = document.createElement("option");
            option.value = product.id;
            option.textContent = `${product.title} - $${product.price}`;
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("productSelect").innerHTML =
            "<option value=''>Error loading products</option>";
    }
}

// Function to add an alert to the active alerts list
function addAlert(productId, desiredPrice) {
    alerts.push({ productId, desiredPrice });
    renderAlerts();
    showMessage("Alert set successfully!", "success");
}

// Render the alerts list in the UI
function renderAlerts() {
    const alertsList = document.getElementById("alertsList");
    alertsList.innerHTML = "";
    alerts.forEach((alert) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `Product ID: ${alert.productId} | Target Price: $${alert.desiredPrice}`;
        alertsList.appendChild(li);
    });
}

// Display a temporary message
function showMessage(message, type) {
    const formMessage = document.getElementById("formMessage");
    formMessage.textContent = message;
    formMessage.className = `alert alert-${type}`;
    setTimeout(() => {
        formMessage.textContent = "";
        formMessage.className = "";
    }, 3000);
}

// Check the current price for each alert
async function checkAlerts() {
    if (alerts.length === 0) return;

    // Loop through alerts and check each one
    for (const alert of alerts) {
        try {
            // Fetch the product data for the given alert
            const response = await fetch(`https://fakestoreapi.com/products/${alert.productId}`);
            const product = await response.json();
            const currentPrice = product.price;
            if (currentPrice <= alert.desiredPrice) {
                triggerNotification(product, alert.desiredPrice);
                // Optionally remove the alert once triggered:
                alerts = alerts.filter((a) => a !== alert);
                renderAlerts();
            }
        } catch (error) {
            console.error("Error checking alert for product:", error);
        }
    }
}

// Trigger an in-app notification when price condition is met
function triggerNotification(product, targetPrice) {
    const notification = document.getElementById("notification");
    notification.textContent = `Price Alert! "${product.title}" is now $${product.price}, which is at or below your target of $${targetPrice}.`;
    notification.classList.remove("d-none");
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.add("d-none");
    }, 5000);
}

// Event listener for form submission
document.getElementById("alertForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const productId = document.getElementById("productSelect").value;
    const desiredPrice = parseFloat(document.getElementById("desiredPrice").value);
    if (!productId || isNaN(desiredPrice)) {
        showMessage("Please select a product and enter a valid price.", "danger");
        return;
    }
    addAlert(productId, desiredPrice);
    e.target.reset();
});

// Initialize app
loadProducts();

// Set an interval to check alerts every 60 seconds
setInterval(checkAlerts, 60000);
