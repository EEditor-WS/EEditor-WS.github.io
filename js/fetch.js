function fetchGet(link, callback) {
    fetch(link)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(() => callback(null));
}
// Использование: 
/*fetchGet(link, (data) => {
    alert(data)
});*/