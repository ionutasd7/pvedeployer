
// Theme switching functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check for saved theme preference or use device preference
  const currentTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Set initial theme
  document.documentElement.setAttribute('data-bs-theme', currentTheme);
  
  // Update the toggle state
  if (document.getElementById('themeToggle')) {
    document.getElementById('themeToggle').checked = currentTheme === 'dark';
  }
  
  // Apply theme-specific CSS classes
  if (currentTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  }
});

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Save theme preference
  localStorage.setItem('theme', newTheme);
  
  // Apply new theme
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  
  // Apply theme-specific CSS classes
  if (newTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  }
}
