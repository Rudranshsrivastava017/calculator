
const expressionEl = document.getElementById('expression');
const resultEl     = document.getElementById('result');

let currentInput  = '';
let fullExpression = '';
let justEvaluated = false;

function formatDisplay(val) {
  if (val === '' || val === null || val === undefined) return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return parseFloat(num.toPrecision(12)).toString();
}

function animateResult() {
  resultEl.classList.remove('animate');
  void resultEl.offsetWidth; // reflow
  resultEl.classList.add('animate');
}

function updateDisplay(expr, res) {
  expressionEl.textContent = expr;
  resultEl.textContent     = res;
  resultEl.classList.toggle('error', res === 'Error');
  animateResult();
}

function appendValue(val) {
  if (justEvaluated) {
    if (/[0-9.]/.test(val)) {
      currentInput   = val;
      fullExpression = val;
    } else {
      currentInput   = '';
      fullExpression = resultEl.textContent + val;
    }
    justEvaluated = false;
  } else {
    if (val === '.') {
      const tokens = currentInput.split(/[\+\-\*\/]/);
      const lastToken = tokens[tokens.length - 1];
      if (lastToken.includes('.')) return;
    }
  
    if (/[\+\-\*\/]/.test(val) && /[\+\-\*\/]$/.test(fullExpression)) {
      fullExpression = fullExpression.slice(0, -1) + val;
      currentInput   = val;
      updateDisplay(formatExpression(fullExpression), resultEl.textContent);
      return;
    }
    currentInput   += val;
    fullExpression += val;
  }

  updateDisplay(formatExpression(fullExpression), formatDisplay(currentInput) === '0' && fullExpression !== '0' ? resultEl.textContent : liveEval(fullExpression));
}

function liveEval(expr) {
  try {
    if (!expr || /[\+\-\*\/]$/.test(expr)) return resultEl.textContent;
    const result = Function('"use strict"; return (' + expr + ')')();
    if (!isFinite(result)) return 'Error';
    return formatDisplay(result);
  } catch {
    return resultEl.textContent;
  }
}

function formatExpression(expr) {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷');
}

function calculate() {
  if (!fullExpression) return;
  try {
    const result = Function('"use strict"; return (' + fullExpression + ')')();
    if (!isFinite(result)) throw new Error('Division by zero');
    const formatted = formatDisplay(result);
    updateDisplay(formatExpression(fullExpression) + ' =', formatted);
    resultEl.textContent = formatted;
    justEvaluated = true;
    currentInput  = formatted;
  } catch {
    updateDisplay(formatExpression(fullExpression), 'Error');
    resultEl.classList.add('error');
    currentInput   = '';
    fullExpression = '';
    justEvaluated  = false;
  }
}

function clearAll() {
  currentInput   = '';
  fullExpression = '';
  justEvaluated  = false;
  updateDisplay('', '0');
}

function backspace() {
  if (justEvaluated) { clearAll(); return; }
  if (!fullExpression) return;
  fullExpression = fullExpression.slice(0, -1);
  currentInput   = currentInput.slice(0, -1);
  const display  = fullExpression ? liveEval(fullExpression) : '0';
  updateDisplay(formatExpression(fullExpression), display);
}

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const val    = btn.dataset.value;

    if (action === 'clear')     clearAll();
    else if (action === 'backspace') backspace();
    else if (action === 'equals')    calculate();
    else if (val !== undefined)      appendValue(val);
  });
});

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9')          appendValue(e.key);
  else if (e.key === '.')                      appendValue('.');
  else if (e.key === '+')                      appendValue('+');
  else if (e.key === '-')                      appendValue('-');
  else if (e.key === '*')                      appendValue('*');
  else if (e.key === '/')                    { e.preventDefault(); appendValue('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace')              backspace();
  else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') clearAll();

  highlightKey(e.key);
});

function highlightKey(key) {
  const map = {
    'Enter': '[data-action="equals"]',
    '=':     '[data-action="equals"]',
    'Escape':'[data-action="clear"]',
    'Backspace': '[data-action="backspace"]',
    '+': '[data-value="+"]',
    '-': '[data-value="-"]',
    '*': '[data-value="*"]',
    '/': '[data-value="/"]',
  };
  const selector = map[key] || `[data-value="${key}"]`;
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.transform = 'scale(0.93)';
  setTimeout(() => { el.style.transform = ''; }, 120);
}