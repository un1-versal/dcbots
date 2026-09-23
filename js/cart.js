//корзина и логика витрины Digital Crafts

//загрузка товаров из data/products.json
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    try {
        const res = await fetch('data/products.json');
        const products = await res.json();
        window.__products = products;
        renderProducts(products);
    } catch (e) {
        grid.innerHTML = '<p style="text-align:center;color:#9aa1af;">Не удалось загрузить товары. Обновите страницу позже.</p>';
    }
}

//рендер карточек товаров
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = '<p style="text-align:center;color:#9aa1af;">Товары временно отсутствуют.</p>';
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" data-platform="${p.platform}">
            <div class="product-badge">${p.platform}</div>
            <h3 class="product-title">${p.title}</h3>
            <p class="product-region">Регион: ${p.region}</p>
            <p class="product-desc">${p.description}</p>
            <div class="product-price-row">
                <span class="product-price">${p.price} ₽</span>
                ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice} ₽</span>` : ''}
            </div>
            <button class="btn-buy" onclick="buyProduct('${p.id}')">Купить</button>
        </div>
    `).join('');
}

//переход к оплате выбранного товара
function buyProduct(id) {
    const product = (window.__products || []).find(p => p.id === id);
    if (!product) return;
    localStorage.setItem('dc_cart', JSON.stringify([product]));
    window.location.href = 'payment.html';
}

//рендер страницы оплаты
function renderPaymentPage() {
    const container = document.getElementById('paymentContent');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('dc_cart') || '[]');
    if (!cart.length) {
        container.innerHTML = `
            <div class="payment-empty">
                <p>Корзина пуста.</p>
                <a href="index.html" class="btn-buy" style="margin-top:16px;">Вернуться в витрину</a>
            </div>
        `;
        return;
    }

    const total = cart.reduce((s, p) => s + p.price, 0);

    container.innerHTML = `
        <div class="payment-layout">
            <div class="payment-cart">
                <h2>Ваш заказ</h2>
                ${cart.map(p => `
                    <div class="payment-item">
                        <div>
                            <strong>${p.title}</strong>
                            <div class="payment-item-meta">${p.platform} · ${p.region}</div>
                        </div>
                        <div class="payment-item-price">${p.price} ₽</div>
                    </div>
                `).join('')}
                <div class="payment-total">
                    <span>Итого:</span>
                    <strong>${total} ₽</strong>
                </div>
            </div>
            <div class="payment-form">
                <h2>Данные для получения ключа</h2>
                <label>Email</label>
                <input type="email" id="buyerEmail" placeholder="you@example.com" required>
                <label style="margin-top:12px;">Согласие с офертой</label>
                <label class="checkbox-row">
                    <input type="checkbox" id="agreeOffer">
                    <span>Я согласен с <a href="offer.html" target="_blank">публичной офертой</a></span>
                </label>
                <button class="btn-buy" style="width:100%;margin-top:20px;" onclick="startPayment()">Перейти к оплате</button>
                <p class="payment-note">Оплата обрабатывается PayMaster. Карта или СБП.</p>
            </div>
        </div>
    `;
}

//заглушка оплаты: тут позже будет ссылка/форма PayMaster
function startPayment() {
    const email = document.getElementById('buyerEmail').value.trim();
    const agree = document.getElementById('agreeOffer').checked;

    if (!email || !email.includes('@')) {
        alert('Укажите корректный email');
        return;
    }
    if (!agree) {
        alert('Подтвердите согласие с офертой');
        return;
    }

    //сохраняем email для последующей передачи в n8n через вебхук PayMaster
    localStorage.setItem('dc_buyer_email', email);

    //ЗАГЛУШКА: здесь будет редирект на платёжную форму PayMaster
    alert('Здесь будет переход на оплату PayMaster. Пока это тестовый режим.');
}

//фильтры по платформам
document.addEventListener('DOMContentLoaded', () => {
    const filters = document.getElementById('platformFilters');
    if (filters) {
        filters.addEventListener('click', e => {
            if (!e.target.classList.contains('filter-btn')) return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const platform = e.target.dataset.platform;
            const all = window.__products || [];
            const filtered = platform === 'all' ? all : all.filter(p => p.platform === platform);
            renderProducts(filtered);
        });
    }
    loadProducts();
});
