const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const number = urlParams.get('number');

document.querySelector('.order-number div').textContent = number;