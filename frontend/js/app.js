// API Base URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

// Global State
let cart = [];
let menuItems = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded');
    checkAuth();
    setupEventListeners();
    loadPageContent();
});

// Check authentication
function checkAuth() {
    if (localStorage.getItem('dottoreLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Logout Button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('dottoreLoggedIn');
        window.location.href = 'index.html';
    });
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        if (!item.id) { // Exclude logout button
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href) {
                    window.history.pushState({}, '', href);
                    loadPageContent();
                }
            });
        }
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        loadPageContent();
    });
    
    // Cart functionality
    setupCartFunctionality();
}

// Load page content based on current URL
async function loadPageContent() {
    const path = window.location.pathname;
    let pageName = 'home';
    
    if (path.includes('add-menu')) pageName = 'add-menu';
    else if (path.includes('view-sales')) pageName = 'view-sales';
    else if (path.includes('add-employee')) pageName = 'add-employee';
    else if (path.includes('view-employees')) pageName = 'view-employees';
    else if (path.includes('add-inventory')) pageName = 'add-inventory';
    else if (path.includes('view-inventory')) pageName = 'view-inventory';
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === pageName + '.html') {
            item.classList.add('active');
        }
    });
    
    // Update page title
    document.getElementById('pageTitle').textContent = getPageTitle(pageName);
    
    // Show/hide cart button
    document.getElementById('cartSection').style.display = 
        pageName === 'home' ? 'block' : 'none';
    
    // Load page content
    try {
        const response = await fetch(`pages/${pageName}.html`);
        const html = await response.text();
        document.getElementById('pageContent').innerHTML = html;
        
        // Update URL without reloading
        window.history.replaceState({}, '', pageName === 'home' ? 'home.html' : pageName + '.html');
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('pageContent').innerHTML = '<div class="error">Error loading page content</div>';
    }
}

function getPageTitle(pageName) {
    const titles = {
        'home': 'Menu Items',
        'add-menu': 'Add Menu Item',
        'view-sales': 'Sales History',
        'add-employee': 'Add Employee',
        'view-employees': 'Employees',
        'add-inventory': 'Add Inventory Item',
        'view-inventory': 'Inventory Items'
    };
    return titles[pageName] || 'Dashboard';
}

// Cart functionality
function setupCartFunctionality() {
    // Cart modal events
    document.getElementById('placeOrderBtn').addEventListener('click', showCustomerModal);
    document.getElementById('confirmOrderBtn').addEventListener('click', placeOrder);
    document.getElementById('printReceiptBtn').addEventListener('click', printReceipt);
    
    // Close modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Cart button
    document.getElementById('cartButton').addEventListener('click', showCartModal);
}

// Global cart functions
window.addToCart = function(itemId) {
    // This will be implemented when menu items are loaded
    console.log('Add to cart:', itemId);
};

window.showCartModal = function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
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

window.placeOrder = function() {
    // Implement place order functionality
};

window.printReceipt = function() {
    // Implement print receipt functionality
};

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModals();
    }
};
