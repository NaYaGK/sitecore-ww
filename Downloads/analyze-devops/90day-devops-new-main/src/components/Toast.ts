export function showToast(msg: string, color?: string) {
  const t = document.createElement('div');
  t.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color || 'var(--s1)'};
    border: 1px solid var(--border);
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    padding: 10px 18px;
    border-radius: var(--r8);
    z-index: 400;
    box-shadow: 0 4px 20px rgba(0,0,0,.4);
    white-space: nowrap;
    opacity: 1;
    pointer-events: none;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .4s';
    setTimeout(() => {
      t.remove();
    }, 400);
  }, 2500);
}
export default showToast;
