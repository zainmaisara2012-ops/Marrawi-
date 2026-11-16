import { db, auth } from './firebase-config.js';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginError = document.getElementById('loginError');
const adminProductsList = document.getElementById('adminProductsList');
const imageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');

let selectedImageBase64 = null;

// معاينة الصورة + تحويلها لـ Base64
imageInput.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;

  // نتحقق من حجم الصورة (يفضل أقل من 800KB)
  if (file.size > 800 * 1024) {
    alert('الصورة كبيرة شوي. حاول تصغرها أو اختار صورة أخف.');
    this.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedImageBase64 = e.target.result;
    imagePreview.src = selectedImageBase64;
    imagePreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// مراقبة حالة تسجيل الدخول
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    loadAdminProducts();
  } else {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
  }
});

// تسجيل الدخول
window.login = async function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginError.textContent = '';
  } catch (error) {
    loginError.textContent = 'الإيميل أو كلمة السر غلط';
  }
};

// تسجيل الخروج
window.logout = async function() {
  await signOut(auth);
};

// إضافة منتج
window.addProduct = async function() {
  const name = document.getElementById('productName').value.trim();
  const price = document.getElementById('productPrice').value.trim();
  const category = document.getElementById('productCategory').value.trim() || 'عام';
  const description = document.getElementById('productDescription').value.trim();

  if (!name) {
    alert('اسم المنتج مطلوب');
    return;
  }

  try {
    await addDoc(collection(db, 'products'), {
      name,
      price: price ? Number(price) : null,
      image: selectedImageBase64 || null,
      category,
      description: description || '',
      createdAt: serverTimestamp()
    });

    // تفريغ الحقول
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    imageInput.value = '';
    imagePreview.style.display = 'none';
    selectedImageBase64 = null;

    alert('تم إضافة المنتج بنجاح');
    loadAdminProducts();
  } catch (error) {
    console.error(error);
    alert('حدث خطأ أثناء الإضافة');
  }
};

// جلب المنتجات
async function loadAdminProducts() {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    adminProductsList.innerHTML = '<p style="color:#64748b;">ما في منتجات حالياً</p>';
    return;
  }

  adminProductsList.innerHTML = '';
  snapshot.forEach(docSnap => {
    const product = docSnap.data();
    const div = document.createElement('div');
    div.className = 'admin-product';
    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        \( {product.image ? `<img src=" \){product.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">` : ''}
        <div>
          <strong>${product.name}</strong><br>
          <small>${product.price ? product.price + ' ل.س' : 'السعر عند الطلب'} | ${product.category}</small>
        </div>
      </div>
      <button onclick="deleteProduct('${docSnap.id}')">حذف</button>
    `;
    adminProductsList.appendChild(div);
  });
}

// حذف منتج
window.deleteProduct = async function(id) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  
  try {
    await deleteDoc(doc(db, 'products', id));
    loadAdminProducts();
  } catch (error) {
    alert('حدث خطأ أثناء الحذف');
  }
};
