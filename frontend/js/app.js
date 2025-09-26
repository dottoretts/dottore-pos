// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Global State
let cart = [];
let menuItems = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('POS System Initialized');
    checkLoginStatus();
    setupEventListeners();
    
    // Handle hash-based routing
    window.addEventListener('hashchange', handleRoute);
    
    // Initial route handling
    handleRoute();
});

// Check login status
function checkLoginStatus() {
    const loggedIn = localStorage.getItem('dottoreLoggedIn');
    if (loggedIn === 'true') {
        showApp();
    } else {
        showLogin();
    }
}

// Handle routing based on URL hash
function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    showPage(hash);
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            window.location.hash = page;
        });
    });
    
    // Cart functionality
    setupCartFunctionality();
    
    // Form submissions
    setupForms();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
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
        
        if (data.success) {
            localStorage.setItem('dottoreLoggedIn', 'true');
            showApp();
            window.location.hash = 'home';
        } else {
            alert('Invalid credentials!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check the server.');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('dottoreLoggedIn');
    cart = [];
    showLogin();
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('appScreen').classList.remove('active');
}

// Show main application
function showApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
}

// Show specific page
function showPage(pageName) {
    console.log('Showing page:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Update active navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target page and update nav
    const targetPage = document.getElementById(`${pageName}Page`);
    const targetNav = document.querySelector(`[data-page="${pageName}"]`);
    
    if (targetPage && targetNav) {
        targetPage.classList.add('active');
        targetNav.classList.add('active');
        
        // Load page-specific data
        loadPageData(pageName);
    } else {
        // Fallback to home page
        showPage('home');
    }
}

// Load data for specific page
function loadPageData(pageName) {
    switch(pageName) {
        case 'home':
            loadHomePage();
            break;
        case 'add-menu':
            loadAddMenuPage();
            break;
        case 'view-sales':
            loadSalesPage();
            break;
        case 'add-employee':
            loadAddEmployeePage();
            break;
        case 'view-employees':
            loadEmployeesPage();
            break;
        case 'add-inventory':
            loadAddInventoryPage();
            break;
        case 'view-inventory':
            loadInventoryPage();
            break;
    }
}

// Page-specific data loading functions
async function loadHomePage() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const data = await response.json();
        menuItems = Array.isArray(data) ? data : (data.data || []);
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menuGrid').innerHTML = '<div class="no-items">Error loading menu</div>';
    }
}

function displayMenuItems(items) {
    const menuGrid = document.getElementById('menuGrid');
    if (!items || items.length === 0) {
        menuGrid.innerHTML = '<div class="no-items">No menu items available</div>';
        return;
    }
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="no-image">No Image</div>'}
            <h3>${item.name}</h3>
            <div class="price">PKR ${item.price.toFixed(2)}</div>
            <div class="description">${item.description}</div>
            <div class="prep-time">Prep Time: ${item.preparationTime} min</div>
            <button class="btn btn-primary" onclick="addToCart('${item._id}')">Add to Cart</button>
        </div>
    `).join('');
}

async function loadAddMenuPage() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        displayMenuItemsList(items);
    } catch (error) {
        console.error('Error loading menu items:', error);
        document.getElementById('menuItemsList').innerHTML = '<div class="no-items">Error loading menu items</div>';
    }
}

function displayMenuItemsList(items) {
    const container = document.getElementById('menuItemsList');
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="no-items">No menu items added yet</div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="menu-item-card">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="price">PKR ${item.price.toFixed(2)}</p>
                <p class="prep-time">Prep Time: ${item.preparationTime} min</p>
                <p class="description">${item.description}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary" onclick="editMenuItem('${item._id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteMenuItem('${item._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add similar functions for other pages...
async function loadSalesPage() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const data = await response.json();
        const orders = Array.isArray(data) ? data : (data.data || []);
        displaySalesData(orders);
        calculateSalesStats(orders);
    } catch (error) {
        console.error('Error loading sales:', error);
        document.getElementById('salesTableBody').innerHTML = '<tr><td colspan="7" class="no-data">Error loading sales data</td></tr>';
    }
}

function displaySalesData(orders) {
    const tbody = document.getElementById('salesTableBody');
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${order.customerName}</td>
            <td>${order.customerPhone}</td>
            <td>${new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
            <td>PKR ${order.total.toFixed(2)}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="viewOrder('${order._id}')">View</button>
            </td>
        </tr>
    `).join('');
}

function calculateSalesStats(orders) {
    const today = new Date().toDateString();
    const todayRevenue = orders
        .filter(order => new Date(order.orderDate || order.createdAt).toDateString() === today)
        .reduce((sum, order) => sum + order.total, 0);
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('todayRevenue').textContent = `PKR ${todayRevenue.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = `PKR ${totalRevenue.toFixed(2)}`;
}

// Setup forms
function setupForms() {
    // Add menu form
    document.getElementById('addMenuForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
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
                this.reset();
                loadAddMenuPage();
                alert('Menu item added successfully!');
            }
        } catch (error) {
            console.error('Error adding menu item:', error);
            alert('Failed to add menu item');
        }
    });
    
    // Add similar form handlers for other forms...
}

// Cart functionality
function setupCartFunctionality() {
    // Cart button
    document.getElementById('cartButton').addEventListener('click', showCartModal);
    
    // Place order
    document.getElementById('placeOrderBtn').addEventListener('click', showCustomerModal);
    document.getElementById('confirmOrderBtn').addEventListener('click', placeOrder);
    document.getElementById('printReceiptBtn').addEventListener('click', printReceipt);
    
    // Close modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
}

// Global functions
window.addToCart = function(itemId) {
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
        alert(`${item.name} added to cart!`);
    }
};

window.updateCartCount = function() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
};

window.showCartModal = function() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    // Implement cart modal display
};

window.closeModals = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
};

window.showCustomerModal = function() {
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('customerModal').style.display = 'block';
};

window.placeOrder = async function() {
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Please fill all customer details');
        return;
    }
    
    // Implement order placement
};

window.printReceipt = function() {
    window.print();
};

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModals();
    }
};

// Placeholder functions
function editMenuItem(id) { alert('Edit: ' + id); }
function deleteMenuItem(id) { 
    if (confirm('Delete this item?')) alert('Delete: ' + id); 
}
function viewOrder(id) { alert('View order: ' + id); }
