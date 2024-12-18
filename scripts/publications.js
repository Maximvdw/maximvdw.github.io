const filterForm = document.getElementById('filter-form');
if (filterForm) {
    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var year = document.getElementById('year-filter').value;
        var type = document.getElementById('type-filter').value.toLowerCase();
        var posts = document.querySelectorAll('.postlist-item');
        
        posts.forEach(function(post) {
            var postYear = post.querySelector('.postlist-date').getAttribute('datetime').split('-')[0];
            var postType = post.getAttribute('data-type').toLowerCase();
            
            if ((year === "" || postYear >= year) && (type === "" || postType === type)) {
                post.style.display = '';
            } else {
                post.style.display = 'none';
            }
        });
    });
}

// Publication citation dialog
function showCitationDialog() {
    document.getElementById('citation-dialog').style.display = 'block';
}

function closeCitationDialog() {
    document.getElementById('citation-dialog').style.display = 'none';
}
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
function copyToClipboard(elementId) {
    var copyText = document.getElementById(elementId).innerText;
    var textArea = document.createElement("textarea");
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    textArea.remove();
    alert("Copied the text: " + copyText);
}

// Select the first tab by default
document.addEventListener('DOMContentLoaded', function() {
    var firstTab = document.querySelector('.tablinks');
    if (firstTab) {
        firstTab.click();
    }
});