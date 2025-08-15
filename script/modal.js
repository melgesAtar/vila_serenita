
document.getElementById('link-privacity').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-privacity').style.display = 'block';
});

document.getElementById('link-terms').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-terms').style.display = 'block';
});


document.querySelectorAll('.close').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelector(this.getAttribute('data-close')).style.display = 'none';
  });
});


window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});
