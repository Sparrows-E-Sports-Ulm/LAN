"use strict";

const format = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
const basket = [];
const basketView = document.getElementById('basket');
const nextButton = document.getElementById('next-btn');
const searchInput = document.getElementById('search');
const regisisteterView = document.getElementById('register');
const regNextButton = document.getElementById('reg-next-btn');

searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    const dishes = document.getElementsByClassName('dish');

    if (query.trim().length === 0) {
        for (const element of dishes) {
            element.style.display = '';
        }
        return;
    }

    for (const element of dishes) {
        if (element.innerText.toLowerCase().includes(query)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    }
}

nextButton.onclick = () => {
    if(basket.length !== 0) {
        regisisteterView.style.display = '';
    }
}

regNextButton.onclick = async () => {
    regNextButton.disabled = true;
    regNextButton.innerHTML = "...";

    const body = basket.map(v => ({
        category: v.catIndex,
        dish: v.dishIndex
    }));

    const res = await fetch('/order/submit', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (res.status === 200) {
        window.location.href = '/order/status';
    } else {
        alert(`Es ist ein Fehler aufgetreten:\n${await res.text()}`);
    }

    regNextButton.innerHTML = "Bestellen & Bezahlen";
    regNextButton.disabled = false;
}

document.getElementById('reg-back-btn').onclick = () => {
    regisisteterView.style.display = 'none';
    regNextButton.innerHTML = "Bestellen & Bezahlen";
    regNextButton.disabled = false;
}

function addToBasket(catIndex, category, dishIndex, dish, price) {
    basket.push({ catIndex: catIndex, category: category, dishIndex: dishIndex, dish: dish, price: price });
    const containerView = document.createElement('div');
    const nameView = document.createElement('span');
    const priceView = document.createElement('span');

    nameView.innerText = dish;
    priceView.innerText = format.format(price);

    containerView.appendChild(nameView);
    containerView.appendChild(priceView);
    basketView.appendChild(containerView);

    nextButton.innerText = `Weiter (${format.format(basket.reduce((acc, current) => acc + current.price, 0))})`;
}

function removeFromBasket(category, dish) {

}