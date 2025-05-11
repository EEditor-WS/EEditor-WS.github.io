document.addEventListener('DOMContentLoaded', function() {
    // Handle URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    // Get the sections and nav elements
    const scenariosSection = document.getElementById('scenarios');
    const mapsSection = document.getElementById('maps');
    const navButtons = document.querySelectorAll('.nav-button[data-page]');
    
    // Function to update page title
    function updatePageTitle(section) {
        const baseTitle = 'EEditor WS';
        document.title = `${baseTitle} | ${section.charAt(0).toUpperCase() + section.slice(1)}`;
    }
    
    // Function to switch sections
    function switchSection(section) {
        // Hide all sections first
        scenariosSection.classList.remove('active');
        mapsSection.classList.remove('active');
        
        // Show the selected section
        if (section === 'maps') {
            mapsSection.classList.add('active');
            history.replaceState({ section: 'maps' }, '', '?section=maps');
        } else {
            // Default to scenarios for invalid or missing section
            scenariosSection.classList.add('active');
            history.replaceState({ section: 'scenarios' }, '', '?section=scenarios');
            section = 'scenarios';
        }
        
        // Update nav button states
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-page') === section);
        });
        
        // Update page title
        updatePageTitle(section);
    }
    
    // Handle initial page load
    switchSection(section);
    
    // Add click handlers for navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const section = this.getAttribute('data-page');
            switchSection(section);
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        const newSection = new URLSearchParams(window.location.search).get('section');
        switchSection(newSection);
    });

    // Handle download buttons if they exist
    const downloadButtons = document.querySelectorAll('.download-button');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Download initiated for: ' + button.innerText);
        });
    });
});
