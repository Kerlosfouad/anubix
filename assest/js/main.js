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
window.addEventListener("load", function () {
    function generateId() {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function getLocalData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || (key === 'favoriteStates' ? {} : []);
        } catch (e) {
            console.error("خطأ في تحليل بيانات Local Storage للمفتاح:", key, e);
            return (key === 'favoriteStates' ? {} : []);
        }
    }

    function setLocalData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function updateLocalObject(key, updateFn) {
        let data = getLocalData(key);
        updateFn(data);
        setLocalData(key, data);
    }

    function getButton(e, className) {
        return e.target.classList.contains(className) ? e.target : e.target.closest('.' + className);
    }


    // تحديث العداد (عدد أنواع المنتجات المختلفة في السلة)
    function updateCounter() {
        let countDiv = document.querySelector('.counter');
        if (!countDiv) return;

        let products = getLocalData('cart');

        if (products.length === 0) {
            countDiv.style.display = 'none';
            let cashForm = document.querySelector('.cash');
            if (cashForm) cashForm.classList.remove('active');
            localStorage.removeItem('cashFormVisible');
        } else {
            countDiv.style.display = 'flex';
            countDiv.innerText = `${products.length}`; // يعرض عدد أنواع المنتجات
        }
    }

    // تحديث السعر الإجمالي الكلي لسلة التسوق (يشمل الآن تكلفة الشحن)
    function updateTotalPrice() {
        let products = getLocalData('cart');
        let total = products.reduce((sum, p) => {
            let priceValue = parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;
            return sum + (priceValue * (p.quantity || 1));
        }, 0);

        // جلب قيمة الشحن من الـ select الخاص بالمحافظات
        const cashFormElement = document.querySelector('.cash');
        const governorateSelect = cashFormElement ? cashFormElement.querySelector('[name="governorate"]') : null;
        let shippingCost = 0;
        if (governorateSelect && governorateSelect.value) {
            shippingCost = parseFloat(governorateSelect.value) || 0;
        }

        let finalTotal = total + shippingCost; // الإجمالي = إجمالي المنتجات + تكلفة الشحن

        let totalSpan = document.querySelector('.total-price');
        if (totalSpan) totalSpan.innerText = `${finalTotal.toFixed(2)} ج.م`;
    }

    function checkCashFormState() {
        const cashForm = document.querySelector('.cash');
        const products = getLocalData('cart');
        const visible = localStorage.getItem('cashFormVisible') === 'true';

        if (cashForm) {
            if (products.length === 0) {
                cashForm.classList.remove('active');
                localStorage.removeItem('cashFormVisible');
            } else if (visible) {
                cashForm.classList.add('active');
                // تحديث السعر الإجمالي عند عرض الفورم لأول مرة (لو كان مخفي ثم ظهر)
                updateTotalPrice(); 
            }
        }
    }

    // دالة عامة لعرض المنتجات (تستخدم لـ cart و favorite)
    function renderProducts(storageKey, templateSelector, emptyText = 'NO PRODUCT', fillCallback) {
        let products = getLocalData(storageKey);
        let template = document.querySelector(templateSelector); 
        let parentContainer = document.querySelector('#shop-items-container'); 
        
        if (storageKey === 'fav') {
            parentContainer = document.querySelector('.main-fav .row'); 
        }

        if (!template || !parentContainer) {
            console.error(`القالب (${templateSelector}) أو حاوية المنتجات (${parentContainer ? parentContainer.id : parentContainer.className}) غير موجودين.`);
            return;
        }

        parentContainer.innerHTML = ''; 
        
        if (products.length === 0) {
            parentContainer.innerHTML = `<p>${emptyText}</p>`;
        } else {
            products.forEach(product => {
                let clone = template.cloneNode(true); 
                clone.style.display = 'block'; 

                const uniqueId = product.id; 

                let quantityInput = clone.querySelector('.quantity');
                if (quantityInput) {
                    quantityInput.id = `quantity-${uniqueId}`;
                    quantityInput.name = `quantity-${uniqueId}`;
                    quantityInput.value = product.quantity || 1; 
                    quantityInput.setAttribute('data-product-id', uniqueId); 
                }

                clone.querySelectorAll('.size input[type="radio"]').forEach(input => {
                    const originalIdPart = input.id.split('-')[0]; 
                    input.id = `${originalIdPart}-${uniqueId}`; 
                    input.name = `size-option-${uniqueId}`; 

                    if (input.value === product.size) {
                        input.checked = true;
                    } else {
                        input.checked = false;
                    }
                });

                clone.querySelectorAll('.size label').forEach(label => {
                    const originalForPart = label.htmlFor.split('-')[0]; 
                    label.htmlFor = `${originalForPart}-${uniqueId}`; 
                });
                
                clone.setAttribute('data-id', uniqueId);

                fillCallback(clone, product);
                parentContainer.appendChild(clone);
            });
        }
    }


    function initializeFavoritesState() {
        let savedStates = getLocalData('favoriteStates');
        document.querySelectorAll('article .love').forEach(btn => {
            let article = btn.closest('article'); 
            let id = article?.getAttribute('data-id');
            if (id && savedStates[id]) {
                btn.classList.add('active'); 
            } else if (id && !savedStates[id]) {
                btn.classList.remove('active'); 
            }
        });
    }

    const path = window.location.pathname;
    const isIndexPage = path === '/' || path.includes('index');
    const isFavoritePage = path.includes('favorite');
    const isShopPage = path.includes('shop');

    document.body.addEventListener('click', function (e) {
        // حدث إضافة منتج للسلة (زر العربة)
        const carBtn = getButton(e, 'car');
        if (carBtn) {
            e.preventDefault();
            let productElement = carBtn.closest('article'); 
            if (!productElement) return;

            let image = productElement.querySelector('.home__img')?.getAttribute('src') || '';
            let price = productElement.querySelector('.home__price')?.innerText || 'غير محدد';
            let title = productElement.querySelector('.shop-name')?.innerText || 'منتج بدون اسم';

            let selectedSizeInput = productElement.querySelector('.size input[type="radio"]:checked');
            let selectedSize = selectedSizeInput ? selectedSizeInput.value : 'غير محدد';

            let cartProducts = getLocalData('cart');
            let existingProduct = cartProducts.find(p => p.title === title && p.size === selectedSize);

            if (existingProduct) {
                existingProduct.quantity = (existingProduct.quantity || 1) + 1;
            } else {
                let product = {
                    id: generateId(), 
                    title,
                    price,
                    image,
                    quantity: 1,
                    size: selectedSize
                };
                cartProducts.push(product);
            }

            setLocalData('cart', cartProducts);
            updateCounter();
            updateTotalPrice();
            checkCashFormState();

            if (isShopPage) renderCartProducts(); 
        }

        // حدث الإضافة/الإزالة من المفضلة (زر القلب)
        const loveBtn = getButton(e, 'love');
        if (loveBtn) {
            let productElement;
            if (isFavoritePage) {
                productElement = loveBtn.closest('.car-fav');
            } else {
                productElement = loveBtn.closest('article');
            }

            if (!productElement) return;

            let id = productElement.getAttribute('data-id') || productElement.querySelector('.shop-name')?.innerText.replace(/\s+/g, '-').toLowerCase() || generateId();
            let image = productElement.querySelector('.home__img, img')?.getAttribute('src') || '';
            let price = productElement.querySelector('.home__price, .shop-salary')?.innerText || 'غير محدد';
            let title = productElement.querySelector('.shop-name')?.innerText || 'منتج بدون اسم';

            let product = { image, title, price, id };
            let favorites = getLocalData('fav');
            let exists = favorites.find(p => p.id === id);

            if (exists) {
                if (isFavoritePage) {
                    favorites = favorites.filter(p => p.id !== id);
                    setLocalData('fav', favorites);
                    updateLocalObject('favoriteStates', states => delete states[id]); 

                    productElement.remove();

                    let parentContainer = document.querySelector('.main-fav .row');
                    const remainingFavProducts = parentContainer ? parentContainer.querySelectorAll('.car-fav') : [];
                    if (remainingFavProducts.length === 0) {
                        if (parentContainer) {
                            parentContainer.innerHTML = `<p class="no-products-message">NO PRODUCT</p>`;
                        }
                    }
                    return; 
                } else {
                    favorites = favorites.filter(p => p.id !== id);
                    loveBtn.classList.remove('active'); 
                    updateLocalObject('favoriteStates', states => delete states[id]); 
                }
            } else {
                favorites.push(product);
                loveBtn.classList.add('active'); 
                updateLocalObject('favoriteStates', states => states[id] = true); 
            }

            setLocalData('fav', favorites);
        }

        // زر Close (إزالة المنتج من السلة)
        const closeBtn = getButton(e, 'close');
        if (closeBtn) {
            let productElement = closeBtn.closest('.car-shop'); 
            let productId = productElement?.getAttribute('data-id'); 

            if (productId) {
                let currentProducts = getLocalData('cart');
                let updatedProducts = currentProducts.filter(p => p.id !== productId); 
                setLocalData('cart', updatedProducts);

                if (isShopPage) renderCartProducts(); 
                updateCounter(); 
                updateTotalPrice(); 
                checkCashFormState(); 
            }
        }

        // زر Done (تأكيد الطلب وإظهار فورم الدفع)
        const doneBtn = getButton(e, 'done');
        if (doneBtn) {
            e.preventDefault();
            const cashForm = document.querySelector('.cash'); 
            const card = doneBtn.closest('.car-shop'); 
            if (cashForm && card) {
                cashForm.classList.add('active'); 
                localStorage.setItem('cashFormVisible', 'true'); 
            }
        }
    });


    // عرض منتجات سلة التسوق (في صفحة الشوب)
    function renderCartProducts() {
        renderProducts('cart', '#product-template', 'لا توجد منتجات في السلة بعد.', (el, p) => {
            el.querySelector('.shop-img').src = p.image;
            el.querySelector('.shop-name').innerText = p.title;
            el.querySelector('.shop-salary').innerText = p.price;

            const sizeDisplay = el.querySelector('.shop-size-display'); 
            if (sizeDisplay) {
                sizeDisplay.innerText = p.size || 'غير محدد';
            }
        });
    }

    // عرض المنتجات المفضلة (في صفحة المفضلة)
    function renderFavoriteProducts() {
        renderProducts('fav', '.car-fav', 'لا توجد منتجات مفضلة.', (el, p) => {
            el.querySelector('img').src = p.image;
            let titleElement = el.querySelector('.shop-name');
            if (titleElement) titleElement.innerText = p.title;

            let priceElement = el.querySelector('.shop-salary');
            if (priceElement) priceElement.innerText = p.price;

            const loveBtnInsideFav = el.querySelector('.love');
            if (loveBtnInsideFav) {
                loveBtnInsideFav.classList.add('active'); 
            }
        });
    }


    // --- بدء التشغيل (Initialization) ---
    function initialize() {
        updateCounter();
        updateTotalPrice(); // تحديث الإجمالي عند تحميل الصفحة لأول مرة
        checkCashFormState();

        if (isShopPage) renderCartProducts();      
        if (isFavoritePage) renderFavoriteProducts(); 
        if (isIndexPage || isShopPage) initializeFavoritesState();
    }

    initialize(); 

    // --- Event Listener لـ "change" (تغيير الكمية والمقاس) ---
    document.body.addEventListener('change', function (e) {
        if (e.target.matches('input.quantity[data-product-id]')) {
            let productId = e.target.getAttribute('data-product-id'); 
            let newQuantity = parseInt(e.target.value); 

            if (productId && !isNaN(newQuantity)) { 
                let currentProducts = getLocalData('cart'); 
                let productToUpdateIndex = currentProducts.findIndex(p => p.id === productId);

                if (productToUpdateIndex !== -1) { 
                    if (newQuantity <= 0) { 
                        currentProducts.splice(productToUpdateIndex, 1);
                    } else { 
                        currentProducts[productToUpdateIndex].quantity = newQuantity;
                    }
                    setLocalData('cart', currentProducts); 

                    if (isShopPage) renderCartProducts(); 
                    updateCounter(); 
                    updateTotalPrice(); 
                    checkCashFormState(); 
                }
            } else if (isNaN(newQuantity)) { 
                let currentProducts = getLocalData('cart');
                let productToUpdate = currentProducts.find(p => p.id === productId);
                if (productToUpdate) {
                    e.target.value = productToUpdate.quantity || 1;
                }
            }
        }
        else if (e.target.matches('input[type="radio"][name^="size-option-"]')) {
            const selectedSize = e.target.value; 
            const productId = e.target.name.split('-').slice(2).join('-'); 

            console.log(`تم تغيير المقاس إلى "${selectedSize}" للمنتج ذو الـ ID: ${productId}`);

            let currentProducts = getLocalData('cart');
            let productToUpdate = currentProducts.find(p => p.id === productId);

            if (productToUpdate) {
                productToUpdate.size = selectedSize; 
                setLocalData('cart', currentProducts); 
                updateTotalPrice(); 
            }
        }
    });

    // --- التعامل مع تأكيد الطلب وإرسال رسالة واتساب ---
    const cashFormElement = document.querySelector('.cash'); 
    const confirmOrderButton = document.querySelector('.confirm-order'); 
    const governorateSelect = cashFormElement ? cashFormElement.querySelector('[name="governorate"]') : null; // عنصر تحديد المحافظة

    if (cashFormElement && confirmOrderButton && governorateSelect) { 
        // Event listener لتغيير المحافظة وتحديث الإجمالي على الواجهة
        governorateSelect.addEventListener('change', function() {
            updateTotalPrice(); // استدعاء الدالة لتحديث الإجمالي بناءً على قيمة الشحن الجديدة
        });

        confirmOrderButton.addEventListener('click', function (e) {
            e.preventDefault(); 

            if (!cashFormElement.checkValidity()) {
                alert('الرجاء ملء جميع الحقول المطلوبة.'); 
                return; 
            }

            const customerName = cashFormElement.querySelector('[name="customerName"]').value;
            const customerPhone1 = cashFormElement.querySelector('[name="customerPhone1"]').value;
            const customerPhone2 = cashFormElement.querySelector('[name="customerPhone2"]').value; 
            
            const governorate = governorateSelect.options[governorateSelect.selectedIndex].text;
            const shippingCost = parseFloat(governorateSelect.value) || 0; 

            const customerAddress = cashFormElement.querySelector('[name="customerAddress"]').value;
            const paymentMethod = cashFormElement.querySelector('[name="paymentMethod"]:checked')?.value || 'غير محدد'; 
            
            let cartProducts = getLocalData('cart'); 
            
            // إعادة حساب السعر الأساسي للمنتجات فقط (قبل إضافة الشحن)
            let baseTotalPrice = cartProducts.reduce((sum, p) => {
                let priceValue = parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;
                return sum + (priceValue * (p.quantity || 1));
            }, 0);
            
            // حساب الإجمالي النهائي الذي سيظهر في رسالة الواتساب
            let finalTotalPrice = baseTotalPrice + shippingCost;


            let whatsappMessage = `*طلب جديد من المتجر الإلكتروني*\n\n`;
            whatsappMessage += `*بيانات العميل:*\n`;
            whatsappMessage += `الاسم: ${customerName}\n`;
            whatsappMessage += `رقم الهاتف الأساسي: ${customerPhone1}\n`;
            if (customerPhone2) {
                whatsappMessage += `رقم هاتف إضافي: ${customerPhone2}\n`;
            }
            whatsappMessage += `المحافظة: ${governorate}\n`;
            whatsappMessage += `العنوان بالتفصيل: ${customerAddress}\n`;
            whatsappMessage += `طريقة الدفع: ${paymentMethod}\n`;


            whatsappMessage += `\n*تفاصيل الطلب:*\n`;
            if (cartProducts.length === 0) {
                whatsappMessage += `السلة فارغة.`;
            } else {
                cartProducts.forEach((p, index) => {
                    whatsappMessage += `${index + 1}. ${p.title} (الحجم: ${p.size || 'غير محدد'}) \n - الكمية: ${p.quantity} \n السعر: ${p.price}\n`;
                });
                whatsappMessage += `\n*تكلفة الشحن: ${shippingCost.toFixed(2)} ج.م*\n`;
                whatsappMessage += `*الإجمالي الكلي (شامل الشحن): ${finalTotalPrice.toFixed(2)} ج.م*\n`;
            }

            const whatsappNumber = '201030732613'; 
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            window.open(whatsappURL, '_blank'); 

            setLocalData('cart', []); 
            updateCounter();
            updateTotalPrice(); // استدعاء الدالة لتحديث الإجمالي بعد إفراغ السلة
            localStorage.removeItem('cashFormVisible'); 
            if (isShopPage) renderCartProducts(); 

            cashFormElement.reset(); 

            alert('تم تأكيد طلبك بنجاح! سيتم تحويلك إلى واتساب لإتمام الطلب.');
        });
    }
});
/*=============== schroll ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '20px', 
    duration: 2000,   
    reset: false,    
    easing: 'cubic-bezier(0.5, 0, 0, 1)', // تحسين سلاسة الحركة
});

// تحريك العناصر الرئيسية
sr.reveal('.active', {
    interval: 100      
});

sr.reveal('.home__circle', {
    scale: 1.5,
    delay: 300,
    distance: '0px',  
    opacity: 0        
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