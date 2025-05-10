/*=============== SWIPER CLOTHING ===============*/
let swiperHome = new Swiper('.home__swiper', {
  loop: true,
  grabCursor: true,
  centeredSlides: true, 

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    765: {
      slidesPerView: 3,
      centeredSlides: true,
    },
    1152: {
      slidesPerView: 3,
      spaceBetween: -60,
      centeredSlides: true,
    }
  }
});

/*=============== SWIPER show hidde ===============*/
const links = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab-content');

links.forEach((i) => {
  i.addEventListener('click', () => {
    links.forEach((link) => {
      link.classList.remove('active')
    })
    tabs.forEach((p) => {
      p.classList.remove('active')
    })
    i.classList.add('active')
    let dataID = i.getAttribute('data-tab')
    document.getElementById(dataID).classList.add('active')
    i.classList.add('active')
  })
})




/*=============== add prodect ===============*/

// استبدال DOMContentLoaded بـ load لضمان تنفيذ الكود بعد تحميل كل الموارد
window.addEventListener("load", function () {
  // دالة توليد ID 
  function generateId() {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function updateCounter() {
    let countDiv = document.querySelector('.counter');
    if (!countDiv) return;

    let products = JSON.parse(localStorage.getItem('cart')) || [];

    if (products.length === 0) {
      countDiv.style.display = 'none';
      let cashForm = document.querySelector('.cash');
      if (cashForm) {
        cashForm.classList.remove('active');
      }
      localStorage.removeItem('cashFormVisible');
    } else {
      countDiv.style.display = 'flex';
      countDiv.innerText = `${products.length}`;
    }
  }

  function updateTotalPrice() {
    let products = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    products.forEach(product => {
      let priceStr = product.price.replace(/[^\d.]/g, '');
      let price = parseFloat(priceStr) || 0;
      total += price;
    });

    let totalSpan = document.querySelector('.total-price');
    if (totalSpan) {
      totalSpan.innerText = `${total.toFixed(2)} ج.م`;
    }
  }

  function checkCashFormState() {
    const cashForm = document.querySelector('.cash');
    const products = JSON.parse(localStorage.getItem('cart')) || [];
    const visible = localStorage.getItem('cashFormVisible') === 'true';

    if (cashForm) {
      if (products.length === 0) {
        cashForm.classList.remove('active');
        localStorage.removeItem('cashFormVisible');
      } else if (visible) {
        cashForm.classList.add('active');
      }
    }
  }

  const path = window.location.pathname;
  const isIndexPage = path === '/' || path.includes('index');
  const isFavoritePage = path.includes('favorite');
  const isShopPage = path.includes('shop');

  document.body.addEventListener('click', function(e) {
    // زر الإضافة للسلة
    if (e.target.classList.contains('car') || e.target.closest('.car')) {
      e.preventDefault();
      const btn = e.target.classList.contains('car') ? e.target : e.target.closest('.car');
      
      let article = btn.closest('article');
      if (!article) return;

      let image = article.querySelector('.home__img')?.getAttribute('src') || '';
      let price = article.querySelector('.home__price')?.innerText || 'غير محدد';
      let title = article.querySelector('.shop-name')?.innerText || 'منتج بدون اسم';

      let product = {
        id: generateId(),
        title: title,
        price: price,
        image: image
      };

      let products = JSON.parse(localStorage.getItem('cart')) || [];
      let exists = products.some(p => p.title === product.title);
      if (!exists) {
        products.push(product);
        localStorage.setItem('cart', JSON.stringify(products));
        updateCounter();
        updateTotalPrice();
        checkCashFormState();
      }
    }

    // زر المفضلة (تم التعديل هنا)
    if (e.target.classList.contains('love') || e.target.closest('.love')) {
      const btn = e.target.classList.contains('love') ? e.target : e.target.closest('.love');
      let article = btn.closest('article');
      let title = article?.querySelector('.shop-name')?.innerText || 'منتج بدون اسم';
      let id = article?.getAttribute('data-id') || title.replace(/\s+/g, '-').toLowerCase();

      let image = article.querySelector('.home__img')?.getAttribute('src') || '';
      let price = article.querySelector('.home__price')?.innerText || 'غير محدد';

      let product = {
        image: image,
        title: title,
        price: price,
        id: id,
      };

      let favorites = JSON.parse(localStorage.getItem('fav')) || [];
      let exists = favorites.find(p => p.id === product.id);

      if (exists) {
        favorites = favorites.filter(p => p.id !== product.id);
        btn.classList.remove('active');

        let savedStates = JSON.parse(localStorage.getItem('favoriteStates')) || {};
        delete savedStates[id];
        localStorage.setItem('favoriteStates', JSON.stringify(savedStates));
      } else {
        favorites.push(product);
        btn.classList.add('active');

        let savedStates = JSON.parse(localStorage.getItem('favoriteStates')) || {};
        savedStates[id] = true;
        localStorage.setItem('favoriteStates', JSON.stringify(savedStates));
      }

      localStorage.setItem('fav', JSON.stringify(favorites));

      // ✅ إذا كنا في صفحة المفضلة، نحذف العنصر من الصفحة مباشرة
      if (isFavoritePage) {
        article.remove();

        const remaining = document.querySelectorAll('.car-fav[style*="display: inline-block"]');
        if (remaining.length === 0) {
          let parent = article.parentElement;
          parent.innerHTML = `<p>NO PRODUCT</p>`;
        }
      }
    }

    // زر الحذف من السلة
    if (e.target.classList.contains('close') || e.target.closest('.close')) {
      const btn = e.target.classList.contains('close') ? e.target : e.target.closest('.close');
      const productElement = btn.closest('.car-shop');
      const productId = productElement?.getAttribute('data-id');

      if (productId) {
        let currentProducts = JSON.parse(localStorage.getItem('cart')) || [];
        let updatedProducts = currentProducts.filter(p => p.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedProducts));
        
        if (isShopPage) {
          renderCartProducts();
        }

        updateCounter();
        updateTotalPrice();
        checkCashFormState();
      }
    }

    // زر Done
    if (e.target.classList.contains('done') || e.target.closest('.done')) {
      e.preventDefault();
      const cashForm = document.querySelector('.cash');
      const card = e.target.closest('.car-shop');

      if (cashForm && card) {
        cashForm.classList.add('active');
        localStorage.setItem('cashFormVisible', 'true');
      }
    }
  });

  // عرض منتجات السلة
  function renderCartProducts() {
    if (!isShopPage) return;

    let products = JSON.parse(localStorage.getItem('cart')) || [];
    let template = document.querySelector('.car-shop');
    let parent = template?.parentElement;

    if (!template || !parent) return;

    if (products.length === 0) {
      parent.innerHTML = `<p>لا توجد منتجات في السلة بعد.</p>`;
    } else {
      template.style.display = 'none';
      parent.innerHTML = ''; // مسح المحتوى الحالي

      products.forEach(product => {
        let clone = template.cloneNode(true);
        clone.style.display = 'block';

        clone.querySelector('.shop-img').src = product.image;
        clone.querySelector('.shop-name').innerText = product.title;
        clone.querySelector('.shop-salary').innerText = product.price;
        clone.setAttribute('data-id', product.id);

        parent.appendChild(clone);
      });
    }
  }

  // عرض منتجات المفضلة
  function renderFavoriteProducts() {
    if (!isFavoritePage) return;

    let products = JSON.parse(localStorage.getItem('fav')) || [];
    let template = document.querySelector('.car-fav');
    let parent = template?.parentElement;

    if (!template || !parent) return;

    if (products.length === 0) {
      parent.innerHTML = `<p>NO PRODUCT</p>`;
    } else {
      template.style.display = 'none';
      parent.innerHTML = ''; // مسح المحتوى الحالي

      products.forEach(product => {
        let clone = template.cloneNode(true);
        clone.style.display = 'inline-block';

        clone.querySelector('img').src = product.image;
        clone.setAttribute('data-id', product.id);

        parent.appendChild(clone);
      });
    }
  }

  // تهيئة
  function initialize() {
    updateCounter();
    updateTotalPrice();
    checkCashFormState();

    if (isShopPage) renderCartProducts();
    if (isFavoritePage) renderFavoriteProducts();

    if (isIndexPage) {
      let savedStates = JSON.parse(localStorage.getItem('favoriteStates')) || {};
      document.querySelectorAll('.love').forEach(btn => {
        let article = btn.closest('article');
        let title = article?.querySelector('.shop-name')?.innerText || 'منتج بدون اسم';
        let id = article?.getAttribute('data-id') || title.replace(/\s+/g, '-').toLowerCase();
        if (savedStates[id]) {
          btn.classList.add('active');
        }
      });
    }
  }

  // تشغيل
  initialize();
});

/*=============== schroll ===============*/
const sr = ScrollReveal({
  origin: 'top',
  distance: '20px', // تقليل المسافة من 60px إلى 20px لتقليل الفراغات
  duration: 2000,   // تقليل المدة قليلاً لتحسين الأداء
  reset: false,     // تعطيل إعادة التحميل التلقائي
  easing: 'cubic-bezier(0.5, 0, 0, 1)', // تحسين سلاسة الحركة
});

// تحريك العناصر الرئيسية
sr.reveal('.active', { 
  interval: 100      // إضافة فواصل زمنية بين العناصر إذا كانت متعددة
});

// تحريك الدوائر مع تحسينات لل scale
sr.reveal('.home__circle', {
  scale: 1.5,
  delay: 300,
  distance: '0px',  // إزالة المسافة الإضافية للعناصر التي تعتمد على scale
  opacity: 0        // بدء العنصر شفافاً لتحسين الانتقال
});

sr.reveal('.home__subcircle', {
  scale: 1.5,
  delay: 500,
  distance: '0px',
  opacity: 0
});

// تحسين تحريك العناوين والروابط
sr.reveal('.home__title', {
  scale: 1,
  origin: 'bottom',
  delay: 1200,
  distance: '10px', // تقليل المسافة الرأسية
  opacity: 0,
  easing: 'ease-out'
});

sr.reveal('.link', {
  scale: 1,
  origin: 'bottom',
  delay: 1200,
  distance: '10px',
  opacity: 0,
  easing: 'ease-out'
});