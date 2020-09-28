const themeName = {
  DARK: 'dark',
  LIGHT: 'light',
};

console.log('Byte Fiction blog')
// current state of the slider.
let btnState = themeName.LIGHT;
// currently activated theme
let currentTheme = themeName.LIGHT;
const switchBtn = document.getElementById('theme-switcher-button');
switchBtn.checked = false;
const cached = localStorage.getItem('theme');

if (cached) {
  currentTheme = cached;
} else {
  localStorage.setItem('theme', currentTheme);
}

document.documentElement.setAttribute('data-theme', currentTheme);
// if the slider is unclicked when the page is loaded 
// but the cached theme is found to be dark, then simulate
// a click before registering the event listener to sync the state
// of the slider and the currently active theme.
if (currentTheme != btnState) switchBtn.checked = true;

switchBtn.onclick = () => {
  if (currentTheme == themeName.DARK) currentTheme = themeName.LIGHT;
  else currentTheme = themeName.DARK;
  btnState = currentTheme;

  localStorage.setItem('theme', currentTheme);
  document.documentElement.setAttribute('data-theme', currentTheme);
};
