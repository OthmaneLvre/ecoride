// Menu burger mobile
const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobileMenu');
const links = document.querySelectorAll('.mobile-menu a');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// Fermer le menu quand on clique sur un lien
for (const link of links) {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
}