import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const filters = document.getElementById('filters');

let allProducts = [];
let currentCategory = 'all';
let currentProduct = null;
let quantity = 1;

// جلب المنتجات
async function loadProducts() {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    allProducts = [];
    snapshot.forEach(doc => {
      allProducts.push({ id: doc.id, ...doc.data() });
    });
    
    renderProducts();
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    productsGrid.innerHTML = '<p style="padding:20px;text-align:center;">حدث خطأ أثناء تحميل المنتجات</p>';
  }
}

// عرض المنتجات
function renderProducts() {
  let filtered = allProducts;

  // فلتر حسب التصنيف
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // فلتر حسب البحث
  const search = searchInput.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.description && p.description.toLowerCase().includes(search))
    );
  }

  if (filtered.length === 0) {
    productsGrid.innerHTML = '<p style="padding:40px;text-align:center;color:#64748b;">ما في منتجات حالياً</p>';
    return;
  }

  productsGrid.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="openModal('${product.id}')">
      <img src="\( {product.image || 'https://via.placeholder.com/300x200?text=لا+صورة'}" alt=" \){product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-price">
          ${product.price ? product.price + ' ل.س' : 'السعر عند الطلب'}
        </div>
      </div>
    </div>
  `).join('');
}

// فتح المودال
window.openModal = function(id) {
  currentProduct = allProducts.find(p => p.id === id);
  if (!currentProduct) return;

  quantity = 1;
  document.getElementById('qtyValue').textContent = quantity;
  document.getElementById('modalImage').src = currentProduct.image || 'https://via.placeholder.com/400x300?text=لا+صورة';
  document.getElementById('modalName').textContent = currentProduct.name;
  document.getElementById('modalPrice').textContent = currentProduct.price 
    ? currentProduct.price + ' ل.س' 
    : 'السعر عند الطلب';
  document.getElementById('modalDescription').textContent = currentProduct.description || '';
  
  document.getElementById('productModal').classList.add('active');
};

window.closeModal = function() {
  document.getElementById('productModal').classList.remove('active');
};

window.changeQty = function(change) {
  quantity = Math.max(1, quantity + change);
  document.getElementById('qtyValue').textContent = quantity;
};

// طلب واتساب
window.orderWhatsApp = function() {
  if (!currentProduct) return;

  const priceText = currentProduct.price ? currentProduct.price + ' ل.س' : 'السعر عند الطلب';
  const message = `مرحبا، بدي أطلب:\n\nالمنتج: ${currentProduct.name}\nالكمية: ${quantity}\nالسعر: ${priceText}\n\nمن موقع دراجات كركر`;
  
  const url = `https://wa.me/963945441140?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

// البحث
searchInput.addEventListener('input', renderProducts);

// الفلاتر
filters.addEventListener('click', (e) => {
  if (e.target.classList.contains('filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderProducts();
  }
});

// تحميل المنتجات عند فتح الصفحة
loadProducts();
