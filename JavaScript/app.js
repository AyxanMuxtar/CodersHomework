// Slider logic
const sliderImages = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80"
];
let currentIndex = 1; // Start with the second image

const sliderImg = document.getElementById('slider-image');
const leftBtn = document.getElementById('slide-left');
const rightBtn = document.getElementById('slide-right');

function showSlide(index) {
    sliderImg.src = sliderImages[index];
}
leftBtn.onclick = function() {
    currentIndex = (currentIndex - 1 + sliderImages.length) % sliderImages.length;
    showSlide(currentIndex);
};
rightBtn.onclick = function() {
    currentIndex = (currentIndex + 1) % sliderImages.length;
    showSlide(currentIndex);
};
showSlide(currentIndex);

// Example random products
const products = [
    {
        title: "Wireless Headphones",
        price: 49.99,
        img: "https://m.media-amazon.com/images/I/71exNLc-CnL._AC_SL1500_.jpg"
    },
    {
        title: "Smart Watch",
        price: 89.99,
        img: "https://i5.walmartimages.com/asr/e1ae90b2-98da-443b-888c-a71228c5234e.eb10d07052b374f38aa17166043f5a7a.jpeg"},
    {
        title: "Coffee Mug",
        price: 12.99,
        img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
    },
    {
        title: "Bluetooth Speaker",
        price: 29.99,
        img: "https://i5.walmartimages.com/asr/536ad9b4-cd11-460a-acc3-457bbf4b218d.ca8f4efe054cc9d1470ba872b656767a.jpeg?odnWidth=1000&odnHeight=1000&odnBg=ffffff"
    },
    {
        title: "Backpack",
        price: 39.99,
        img: "https://assets.trends.nz/Images/ProductImg/121427-1.jpg"
    },
    {
        title: "Sunglasses",
        price: 19.99,
        img: "https://m.media-amazon.com/images/I/51hWZ7P9XyL._AC_SL1500_.jpg"
    }
];

// Render product cards
const productsDiv = document.getElementById('products');
products.forEach((product, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${product.img}" alt="${product.title}">
        <div class="card-title">${product.title}</div>
        <div class="card-price">$${product.price.toFixed(2)}</div>
        <button class="add-btn" data-idx="${idx}">Add to Basket</button>
    `;
    productsDiv.appendChild(card);
});

// Basket logic
let basketCount = 0;
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        basketCount++;
        document.getElementById('basket-count').textContent = basketCount;
    });
});