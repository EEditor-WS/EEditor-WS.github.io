document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download-button');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // You can add download tracking or validation here
            console.log('Download initiated for: ' + button.innerText);
        });
    });
});
