document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.show-details').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.querySelector(button.getAttribute('data-target'));
        if (target.classList.contains('collapse')) {
          target.classList.remove('collapse');
          button.textContent = 'Hide details ...';
        } else {
          target.classList.add('collapse');
          button.textContent = 'Show details ...';
        }
      });
    });
});