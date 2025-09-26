// API Base URL - Fixed for Vercel deployment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Global State
let currentUser = null;
let cart = [];
let menuItems = [];
let orders = [];
let employees = [];
let inventoryItems = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const customerModal = document.getElementById('customerModal');
const receiptModal = document.getElementById('receiptModal');
const closeButtons = document.querySelectorAll('.close');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const printReceiptBtn = document.getElementById('printReceiptBtn');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    checkLoginStatus();
    setupEventListeners();
});

// Check if user is logged in
function checkLoginStatus() {
    const loggedIn = localStorage.getItem('dottoreLoggedIn');
    console.log('Login status:', loggedIn);
    if (loggedIn === 'true') {
        showApp();
    } else {
        showLogin();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login Form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout Button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navItems.forEach(item => {
        if (item.id !== 'logoutBtn') {
            item.addEventListener('click', handleNavigation);
        }
    });
    
    // Cart Button
    cartButton.addEventListener('click', showCartModal);
    
    // Close Modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Place Order
    placeOrderBtn.addEventListener('click', showCustomerModal);
    confirmOrderBtn.addEventListener('click', placeOrder);
    
    // Print Receipt
    printReceiptBtn.addEventListener('click', printReceipt);
    
    // No Expiry Checkbox
    const noExpiryCheckbox = document.getElementById('invNoExpiry');
    if (noExpiryCheckbox) {
        noExpiryCheckbox.addEventListener('change', function() {
            const expiryDateGroup = document.getElementById('expiryDateGroup');
            if (expiryDateGroup) {
                expiryDateGroup.style.display = this.checked ? 'none' : 'block';
            }
        });
    }
    
    // Forms
    const addMenuForm = document.getElementById('addMenuForm');
    if (addMenuForm) {
        addMenuForm.addEventListener('submit', addMenuItem);
    }
    
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    if (addEmployeeForm) {
        addEmployeeForm.addEventListener('submit', addEmployee);
    }
    
    const addInventoryForm = document.getElementById('addInventoryForm');
    if (addInventoryForm) {
        addInventoryForm.addEventListener('submit', addInventoryItem);
    }
    
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterMenuItems);
    }
    
    console.log('Event listeners setup complete');
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.success) {
            localStorage.setItem('dottoreLoggedIn', 'true');
            showApp();
        } else {
            alert('Invalid credentials! Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Logout Handler
function handleLogout() {
    localStorage.removeItem('dottoreLoggedIn');
    cart = [];
    showLogin();
}

// Show Login Screen
function showLogin() {
    loginScreen.classList.add('active');
    appScreen.classList.remove('active');
    loginForm.reset();
}

// Show Main Application
function showApp() {
    loginScreen.classList.remove('active');
    appScreen.classList.add('active');
    loadHomePage();
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    console.log('Navigation clicked:', this.getAttribute('data-page'));
    
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    this.classList.add('active');
    
    // Show corresponding page
    const pageId = this.getAttribute('data-page');
    showPage(pageId);
}

// Show Specific Page
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        switch(pageId) {
            case 'home':
                loadHomePage();
                break;
            case 'add-menu':
                loadMenuItems();
                break;
            case 'view-sales':
                loadSalesData();
                break;
            case 'view-employees':
                loadEmployees();
                break;
            case 'view-inventory':
                loadInventory();
                break;
        }
    } else {
        console.error('Page not found:', pageId);
    }
}

// Load Home Page (Menu Items)
async function loadHomePage() {
    console.log('Loading home page...');
    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuItems = await response.json();
        console.log('Menu items loaded:', menuItems);
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
        showNotification('Error loading menu items. Please check console for details.');
    }
}

// Display Menu Items
function displayMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) {
        console.error('Menu grid element not found');
        return;
    }
    
    menuGrid.innerHTML = '';
    
    if (items.length === 0) {
        menuGrid.innerHTML = '<div class="no-items">No menu items available. Please add some items first.</div>';
        return;
    }
    
    items.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.innerHTML = `
            ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">` : '<div style="height:150px;background:#ddd;display:flex;align-items:center;justify-content:center;color:#666;">No Image</div>'}
            <h3>${item.name}</h3>
            <div class="price">PKR ${item.price.toFixed(2)}</div>
            <div class="description">${item.description}</div>
            <div class="prep-time">Prep Time: ${item.preparationTime} min</div>
            <button class="btn btn-primary" onclick="addToCart('${item._id}')">Add to Cart</button>
        `;
        menuGrid.appendChild(menuItemElement);
    });
}

// Filter Menu Items
function filterMenuItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    displayMenuItems(filteredItems);
}

// Add to Cart
function addToCart(itemId) {
    const item = menuItems.find(i => i._id === itemId);
    if (item) {
        const existingItem = cart.find(i => i.menuItem._id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                menuItem: item,
                quantity: 1,
                price: item.price
            });
        }
        updateCartCount();
        showNotification(`${item.name} added to cart!`);
    }
}

// Update Cart Count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Show Cart Modal
function showCartModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div>
                <h4>${item.menuItem.name}</h4>
                <p>PKR ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <span>PKR ${itemTotal.toFixed(2)}</span>
                <button class="btn btn-secondary" onclick="removeFromCart(${index})" style="margin-left:10px;">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    const tax = subtotal * 0.14;
    const discountInput = document.getElementById('discountInput');
    const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    const total = subtotal + tax - discount;
    
    document.getElementById('cartSubtotal').textContent = `PKR ${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `PKR ${tax.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `PKR ${total.toFixed(2)}`;
    
    cartModal.style.display = 'block';
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    showCartModal();
}

// Show Customer Modal
function showCustomerModal() {
    cartModal.style.display = 'none';
    customerModal.style.display = 'block';
}

// Place Order
async function placeOrder() {
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const discountInput = document.getElementById('discountInput');
    const discount = discountInput ? parseFloat(discountInput.value) || 0 : 0;
    
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill in all customer details.');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.14;
    const total = subtotal + tax - discount;
    
    const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        items: cart.map(item => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity,
            price: item.price
        })),
        tax: 14,
        discount,
        subtotal,
        total
    };
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const order = await response.json();
            showReceipt(order.data || order);
            cart = [];
            updateCartCount();
            customerModal.style.display = 'none';
            document.getElementById('customerForm').reset();
        } else {
            throw new Error('Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Show Receipt
function showReceipt(order) {
    const receiptContent = document.getElementById('receiptContent');
    
    let itemsHtml = '';
    order.items.forEach(item => {
        const itemName = item.menuItem?.name || item.name || 'Unknown Item';
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        itemsHtml += `
            <div class="receipt-item">
                <span>${itemName} x ${itemQuantity}</span>
                <span>PKR ${(itemPrice * itemQuantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h3>Dottore's Fast Food</h3>
            <p>Order #: ${order.orderNumber || 'N/A'}</p>
            <p>Date: ${new Date(order.orderDate || order.createdAt).toLocaleString()}</p>
        </div>
        <div class="receipt-customer">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
            <p><strong>Address:</strong> ${order.customerAddress}</p>
        </div>
        <div class="receipt-items">
            ${itemsHtml}
        </div>
        <div class="receipt-total">
            <div class="receipt-item">
                <span>Subtotal:</span>
                <span>PKR ${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="receipt-item">
                <span>Tax (14%):</span>
                <span>PKR ${order.tax.toFixed(2)}</span>
            </div>
            <div class="receipt-item">
                <span>Discount:</span>
                <span>PKR ${order.discount.toFixed(2)}</span>
            </div>
            <div class="receipt-item">
                <span><strong>Total:</strong></span>
                <span><strong>PKR ${order.total.toFixed(2)}</strong></span>
            </div>
        </div>
        <div class="receipt-footer">
            <p>Thank you for your order!</p>
        </div>
    `;
    
    receiptModal.style.display = 'block';
}

// Print Receipt
function printReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt - Dottore's</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .receipt-total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                    .receipt-header, .receipt-footer { text-align: center; margin: 10px 0; }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Close Modals
function closeModals() {
    cartModal.style.display = 'none';
    customerModal.style.display = 'none';
    receiptModal.style.display = 'none';
}

// Add Menu Item
async function addMenuItem(e) {
    e.preventDefault();
    console.log('Adding menu item...');
    
    const formData = new FormData(e.target);
    const itemData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        preparationTime: parseInt(formData.get('preparationTime')),
        image: formData.get('image') || ''
    };
    
    try {
        const response = await fetch(`${API_BASE}/menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            const result = await response.json();
            e.target.reset();
            loadMenuItems();
            showNotification('Menu item added successfully!');
        } else {
            throw new Error('Failed to add menu item');
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        alert('Failed to add menu item. Please try again.');
    }
}

// Load Menu Items for Management
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const result = await response.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        displayMenuItemsList(items);
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Display Menu Items List
function displayMenuItemsList(items) {
    const menuList = document.getElementById('menuItemsList');
    if (!menuList) return;
    
    menuList.innerHTML = '';
    
    if (items.length === 0) {
        menuList.innerHTML = '<div class="no-items">No menu items added yet.</div>';
        return;
    }
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item-list';
        itemElement.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #ddd;">
                <div>
                    <h4>${item.name}</h4>
                    <p>PKR ${item.price.toFixed(2)} | Prep Time: ${item.preparationTime} min</p>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="editMenuItem('${item._id}')">Edit</button>
                    <button class="btn btn-primary" onclick="deleteMenuItem('${item._id}')" style="margin-left:5px;">Delete</button>
                </div>
            </div>
        `;
        menuList.appendChild(itemElement);
    });
}

// Add Employee
async function addEmployee(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const employeeData = {
        name: formData.get('name'),
        cnic: formData.get('cnic'),
        phone: formData.get('phone'),
        joiningDate: formData.get('joiningDate'),
        status: formData.get('status')
    };
    
    try {
        const response = await fetch(`${API_BASE}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (response.ok) {
            e.target.reset();
            showNotification('Employee added successfully!');
        } else {
            throw new Error('Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Failed to add employee. Please try again.');
    }
}

// Load Employees
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/employees`);
        const result = await response.json();
        employees = Array.isArray(result) ? result : (result.data || []);
        displayEmployees();
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// Display Employees
function displayEmployees() {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.cnic}</td>
            <td>${emp.phone}</td>
            <td>${new Date(emp.joiningDate).toLocaleDateString()}</td>
            <td>
                <span class="status ${emp.status === 'working' ? 'working' : 'not-working'}">
                    ${emp.status}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary" onclick="editEmployee('${emp._id}')">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add Inventory Item
async function addInventoryItem(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const hasNoExpiry = document.getElementById('invNoExpiry').checked;
    
    const inventoryData = {
        name: formData.get('name'),
        quantity: parseInt(formData.get('quantity')),
        purchaseDate: formData.get('purchaseDate'),
        purchasePrice: parseFloat(formData.get('purchasePrice')),
        expiryDate: hasNoExpiry ? null : formData.get('expiryDate'),
        hasNoExpiry
    };
    
    try {
        const response = await fetch(`${API_BASE}/inventory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inventoryData)
        });
        
        if (response.ok) {
            e.target.reset();
            showNotification('Inventory item added successfully!');
        } else {
            throw new Error('Failed to add inventory item');
        }
    } catch (error) {
        console.error('Error adding inventory item:', error);
        alert('Failed to add inventory item. Please try again.');
    }
}

// Load Inventory
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/inventory`);
        const result = await response.json();
        inventoryItems = Array.isArray(result) ? result : (result.data || []);
        displayInventory();
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

// Display Inventory
function displayInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    inventoryItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${new Date(item.purchaseDate).toLocaleDateString()}</td>
            <td>PKR ${item.purchasePrice.toFixed(2)}</td>
            <td>${item.hasNoExpiry ? 'No Expiry' : new Date(item.expiryDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-secondary" onclick="editInventoryItem('${item._id}')">Edit</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load Sales Data
async function loadSalesData() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const result = await response.json();
        orders = Array.isArray(result) ? result : (result.data || []);
        displaySalesData();
        calculateSalesStats();
    } catch (error) {
        console.error('Error loading sales data:', error);
    }
}

// Display Sales Data
function displaySalesData() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.customerName}</td>
            <td>${new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
            <td>PKR ${order.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewOrderDetails('${order._id}')">View</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Calculate Sales Statistics
function calculateSalesStats() {
    const today = new Date().toDateString();
    const todayRevenue = orders
        .filter(order => new Date(order.orderDate || order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + order.total, 0);
    
    const todayRevenueElem = document.getElementById('todayRevenue');
    const totalOrdersElem = document.getElementById('totalOrders');
    
    if (todayRevenueElem) todayRevenueElem.textContent = `PKR ${todayRevenue.toFixed(2)}`;
    if (totalOrdersElem) totalOrdersElem.textContent = orders.length;
}

// Show Notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModals();
    }
}

// Placeholder functions for edit operations
function editMenuItem(id) {
    alert('Edit functionality for menu item ' + id + ' would be implemented here.');
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        // Implement delete functionality
        alert('Delete functionality for menu item ' + id + ' would be implemented here.');
    }
}

function editEmployee(id) {
    alert('Edit functionality for employee ' + id + ' would be implemented here.');
}

function editInventoryItem(id) {
    alert('Edit functionality for inventory item ' + id + ' would be implemented here.');
}

function viewOrderDetails(id) {
    alert('View order details for ' + id + ' would be implemented here.');
}
