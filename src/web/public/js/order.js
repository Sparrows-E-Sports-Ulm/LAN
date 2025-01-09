"use strict";

const format = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
const basketView = document.getElementById('basket');
const nextButton = document.getElementById('next-btn');
const searchInput = document.getElementById('search');
const regisisteterView = document.getElementById('register');
const regNextButton = document.getElementById('reg-next-btn');
const nameTb = document.getElementById('name');
const lastNameTb = document.getElementById('last-name');
const trashIcon = document.getElementById('trash-icon').children[0];

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
    if (basket.length !== 0) {
        regisisteterView.style.display = '';
    }
}

regNextButton.onclick = async () => {
    if (nameTb.value.trim().length == 0 || lastNameTb.value.trim().length == 0) {
        return;
    }

    regNextButton.disabled = true;
    regNextButton.innerHTML = "...";

    const basket = Array.prototype.map.call(document.getElementsByClassName('basket-item'), (e) => ({
        category: parseInt(e.dataset.catIndex),
        dish: parseInt(e.dataset.dishIndex)
    }));

    const body = {
        basket: basket,
        name: `${nameTb.value} ${lastNameTb.value}`
    };

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
    const containerView = document.createElement('div');
    containerView.classList.add('basket-item');
    containerView.dataset.catIndex = catIndex;
    containerView.dataset.category = category;
    containerView.dataset.dishIndex = dishIndex;
    containerView.dataset.dish = dish;
    containerView.dataset.price = price;

    const nameView = document.createElement('span');
    const priceView = document.createElement('span');
    const delButton = document.createElement('button');
    delButton.appendChild(trashIcon.cloneNode(true));

    nameView.innerText = dish;
    priceView.innerText = format.format(price);

    containerView.appendChild(nameView);
    containerView.appendChild(priceView);
    containerView.appendChild(delButton);
    basketView.appendChild(containerView);

    delButton.onclick = () => {
        containerView.remove();
        updateTotal();
    }

    updateTotal();
}

function updateTotal() {
    const basket = document.getElementsByClassName('basket-item');
    const total = Array.prototype.reduce.call(basket, (acc, current) => acc + parseFloat(current.dataset.price), 0);
    if (total == 0) {
        nextButton.innerText = `Weiter`;
        nextButton.disabled = true;
    } else {
        nextButton.innerText = `Weiter (${format.format(total)})`;
        nextButton.disabled = false;
    }
}
