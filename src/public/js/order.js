"use strict";

const format = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}) 
const basket = [];
const basketView = document.getElementById('basket');


function addToBasket(category, dish, price) {
    basket.push({category: category, dish: dish, price: price});
    const containerView = document.createElement('div');
    const nameView = document.createElement('span');
    const priceView = document.createElement('span');

    nameView.innerText = dish;
    priceView.innerText = format.format(price);

    containerView.appendChild(nameView);
    containerView.appendChild(priceView);
    basketView.appendChild(containerView);
}

function removeFromBasket(category, dish) {

}