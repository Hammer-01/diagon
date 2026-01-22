// show santa hat at christmas time
let today = new Date();
if (today.getMonth() === 11 && 1 <= today.getDate() && today.getDate() <= 26) {
    document.querySelector('img[src$="/santa-hat.png"]').hidden = false;
}