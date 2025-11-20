// main.js - Right Sidebar + Your Logic
const sidebar = document.querySelector(".sidebar");
const menu = document.getElementById("menu");
const back = document.querySelector(".back");
const seeMoreButtons = document.querySelectorAll(".see-more");
const popup = document.getElementById("popup");
const closePopup = document.querySelector(".close-popup");
const detailsContainer = document.querySelector(".details-container");
const overlay = document.querySelector(".overlay");

// Open Sidebar (Right)
menu.addEventListener("click", () => {
  sidebar.classList.add("active");
  overlay.classList.add("active");
});

// Close with Back
back.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// Close clicking outside
overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  popup.classList.remove("active");
});

// See More → Popup
seeMoreButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".boxx");
    const title = card.querySelector("h2").textContent;
    const price = card.querySelector("h5").textContent;
    const brand = card.querySelector("h6").textContent;
    const desc = card.querySelector("p").textContent;
    
    detailsContainer.innerHTML = `
            <h2>${title}</h2>
            <p><strong>Price:</strong> ${price}</p>
            <p><strong>Brand:</strong> ${brand}</p>
            <p>${desc}</p>
            <button class="buy-btn" onclick="alert('Added to cart!')">Buy Now</button>
        `;
    popup.classList.add("active");
    overlay.classList.add("active");
  });
});

// Close Popup
closePopup.addEventListener("click", () => {
  popup.classList.remove("active");
  overlay.classList.remove("active");
});
// Function to load products from both localStorage and JSON file
async function loadProducts() {
  let products = [];
  
  // Try to load from localStorage first
  const localProducts = JSON.parse(localStorage.getItem('medcare_products')) || [];
  products = localProducts;
  
  try {
    // Try to load from JSON file as well
    const response = await fetch('products.json');
    if (response.ok) {
      const jsonData = await response.json();
      // Merge products from both sources, removing duplicates by ID
      const allProducts = [...localProducts, ...jsonData.products];
      products = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
      // Update localStorage with merged data
      localStorage.setItem('medcare_products', JSON.stringify(products));
    }
  } catch (error) {
    console.error('Error loading from JSON:', error);
  }
  
  // Store products globally for search functionality
  window.allProducts = products;
  displayProducts(products);
}

// Function to display products in the content area
function displayProducts(products) {
  const contentDiv = document.querySelector('.content');
  if (!contentDiv) return;
  
  if (products.length === 0) {
    contentDiv.innerHTML = '<p class="no-products">No products available.</p>';
    return;
  }
  
  let html = '';
  products.forEach(product => {
    html += `
            <div class="boxx">
                <h2>${product.name}</h2>
                <h5>${product.brand}</h5>
                <h6>$${product.price}</h6>
                <p>${product.description}</p>
                <button class="see-more">See More</button>
            </div>
        `;
  });
  
  contentDiv.innerHTML = html;
  
  // Add event listeners for "See More" buttons
  document.querySelectorAll('.see-more').forEach(button => {
    button.addEventListener('click', function() {
      const productBox = this.parentElement;
      const description = productBox.querySelector('p');
      if (description) {
        description.style.display = description.style.display === 'none' ? 'block' : 'none';
      }
    });
  });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  setupSearch();
  checkUserLogin();
});

// Check if user is already logged in
function checkUserLogin() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    console.log('User logged in:', user.email);
  }
}

// Open Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('show');
}

// Close Modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
}

// Switch between modals
function switchModal(closeId, openId) {
  closeModal(closeId);
  openModal(openId);
}

// Handle Sign In
function handleSignIn(event) {
  event.preventDefault();
  
  const email = document.getElementById('signInEmail').value.trim();
  const password = document.getElementById('signInPassword').value;
  const confirm = document.getElementById('signInConfirm').value;
  
  // Validation
  if (password !== confirm) {
    alert('পাসওয়ার্ড মিলেনি!');
    return;
  }
  
  if (password.length < 6) {
    alert('পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে!');
    return;
  }
  
  // Check if email already exists
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some(u => u.email === email)) {
    alert('এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে!');
    return;
  }
  
  // Save new user
  const newUser = { email, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Log in the user
  localStorage.setItem('currentUser', JSON.stringify({ email }));
  
  alert('সফলভাবে সাইন ইন হয়েছেন!');
  closeModal('signInModal');
  document.getElementById('signInForm').reset();
  
  // Redirect to admin
  setTimeout(() => {
    window.location.href = 'admin.html';
  }, 500);
}

// Handle Log In
function handleLogIn(event) {
  event.preventDefault();
  
  const email = document.getElementById('logInEmail').value.trim();
  const password = document.getElementById('logInPassword').value;
  
  // Get users
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email);
  
  if (!user) {
    alert('ইমেইল পাওয়া যায়নি! প্রথমে সাইন ইন করুন।');
    return;
  }
  
  if (user.password !== password) {
    alert('পাসওয়ার্ড ভুল!');
    return;
  }
  
  // Log in the user
  localStorage.setItem('currentUser', JSON.stringify({ email }));
  
  alert('সফলভাবে লগ ইন হয়েছেন!');
  closeModal('logInModal');
  document.getElementById('logInForm').reset();
  
  // Redirect to admin
  setTimeout(() => {
    window.location.href = 'admin.html';
  }, 500);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
  const signInModal = document.getElementById('signInModal');
  const logInModal = document.getElementById('logInModal');
  
  if (event.target === signInModal) {
    closeModal('signInModal');
  }
  if (event.target === logInModal) {
    closeModal('logInModal');
  }
});

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector('.searchbar');
  const searchContainer = document.querySelector('.search-container');
  
  if (!searchInput) return;
  
  // Create dropdown for results
  const dropdown = document.createElement('div');
  dropdown.className = 'search-results-dropdown';
  dropdown.style.display = 'none';
  searchContainer.parentElement.appendChild(dropdown);
  
  // Search input event listener
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    
    // Filter products based on search query
    const results = (window.allProducts || []).filter(product => {
      const name = product.name.toLowerCase();
      const brand = product.brand.toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      return name.includes(query) || brand.includes(query) || description.includes(query);
    });
    
    // Display results
    if (results.length === 0) {
      dropdown.innerHTML = '<div class="no-results">কোনো প্রোডাক্ট পাওয়া যায়নি</div>';
    } else {
      let html = '';
      results.forEach(product => {
        html += `
                    <div class="search-result-item" onclick="selectProduct('${product.id}')">
                        <div class="result-name">${product.name}</div>
                        <div class="result-brand">ব্র্যান্ড: ${product.brand}</div>
                        <div class="result-price">৳ ${product.price}</div>
                    </div>
                `;
      });
      dropdown.innerHTML = html;
    }
    
    dropdown.style.display = 'block';
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchContainer.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  // Clear on focus for better UX
  searchInput.addEventListener('focus', function() {
    if (this.value.length > 0) {
      dropdown.style.display = 'block';
    }
  });
}

// Function to select product from search results
function selectProduct(productId) {
  const product = (window.allProducts || []).find(p => p.id === productId);
  if (!product) return;
  
  // Scroll to product or display it
  const dropdown = document.querySelector('.search-results-dropdown');
  dropdown.style.display = 'none';
  
  // Clear search
  const searchInput = document.querySelector('.searchbar');
  searchInput.value = '';
  
  // Optionally: scroll to the product in the content area
  // Or show a popup with product details
  alert(`পণ্য: ${product.name}\nব্র্যান্ড: ${product.brand}\nমূল্য: ৳ ${product.price}\n\nবিবরণ: ${product.description}`);
}