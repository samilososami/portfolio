const buttons = [...document.querySelectorAll('[data-filter]')];
const projects = [...document.querySelectorAll('.project[data-category]')];
const status = document.getElementById('filter-status');
for (const button of buttons) {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    for (const item of buttons) item.setAttribute('aria-pressed',String(item===button));
    let count=0;
    for (const project of projects) {
      project.hidden = category!=='all' && !project.dataset.category.split(' ').includes(category);
      if(!project.hidden) count++;
    }
    status.textContent = count + ' herramientas en ' + button.textContent + '. Los proyectos Casio siguen destacados arriba.';
  });
}
