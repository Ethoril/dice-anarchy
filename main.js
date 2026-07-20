// State
const MAX_POOL = 50; // garde-fou anti-clic infini
let poolSize = 6;
let compSize = 0;
let useGlitch = false;
let useLuckPreRoll = false;

// Seuil de succès : abaissé à 4 avec la Chance Avant-Jet, sinon 5.
function getThreshold() {
  return useLuckPreRoll ? 4 : 5;
}

// Seuil d'Exploit du Dé d'Imprévu : toujours 5-6, indépendant de la Chance.
const EXPLOIT_THRESHOLD = 5;

// Roll results
let currentDice = []; // array of objects: { type, value, success, reRolled }
let totalSuccesses = 0;
let hasRolled = false;

// DOM Elements
const elPoolVal = document.getElementById('val-pool');
const btnPoolMinus = document.getElementById('btn-pool-minus');
const btnPoolPlus = document.getElementById('btn-pool-plus');

const elCompVal = document.getElementById('val-comp');
const btnCompMinus = document.getElementById('btn-comp-minus');
const btnCompPlus = document.getElementById('btn-comp-plus');

const toggleGlitch = document.getElementById('toggle-glitch');
const toggleLuck = document.getElementById('toggle-luck');

const btnRoll = document.getElementById('btn-roll');
const btnReroll = document.getElementById('btn-reroll-failures');

const resultsArea = document.getElementById('results-area');
const totalSuccessesEl = document.getElementById('total-successes');
const alertsContainer = document.getElementById('alerts-container');
const diceDisplay = document.getElementById('dice-display');

const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const closeModal = document.getElementById('close-modal');

// Init
function init() {
  updateUI();
  
  // Events
  btnPoolMinus.addEventListener('click', () => { if (poolSize > 1) { poolSize--; enforceLimits(); updateUI(); } });
  btnPoolPlus.addEventListener('click', () => { if (poolSize < MAX_POOL) { poolSize++; enforceLimits(); updateUI(); } });
  
  btnCompMinus.addEventListener('click', () => { if (compSize > 0) { compSize--; enforceLimits(); updateUI(); } });
  btnCompPlus.addEventListener('click', () => { compSize++; enforceLimits(); updateUI(); });
  
  toggleGlitch.addEventListener('change', (e) => { useGlitch = e.target.checked; });
  toggleLuck.addEventListener('change', (e) => { useLuckPreRoll = e.target.checked; });
  
  btnRoll.addEventListener('click', rollDice);
  btnReroll.addEventListener('click', rerollLuck);
  
  // Modal
  infoBtn.addEventListener('click', openModal);
  closeModal.addEventListener('click', closeInfoModal);
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) closeInfoModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) closeInfoModal();
  });
}

function openModal() {
  infoModal.classList.remove('hidden');
  closeModal.focus(); // amène le focus dans la modale
}

function closeInfoModal() {
  infoModal.classList.add('hidden');
  infoBtn.focus(); // rend le focus au déclencheur
}

function enforceLimits() {
  if (compSize > poolSize) {
    compSize = poolSize;
  }
}

function updateUI() {
  elPoolVal.textContent = poolSize;
  elCompVal.textContent = compSize;
  
  btnPoolMinus.disabled = poolSize <= 1;
  btnPoolPlus.disabled = poolSize >= MAX_POOL;
  btnCompMinus.disabled = compSize <= 0;
  btnCompPlus.disabled = compSize >= poolSize;
}

function getRandomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateDie(die, threshold) {
  die.success = die.value >= threshold;
}

function rollDice() {
  hasRolled = true;
  currentDice = [];

  const threshold = getThreshold();
  
  // Normal dice
  const normalCount = poolSize - compSize;
  for (let i = 0; i < normalCount; i++) {
    const val = getRandomDie();
    currentDice.push({ type: 'normal', value: val, success: val >= threshold, reRolled: false });
  }
  
  // Complication dice
  for (let i = 0; i < compSize; i++) {
    const val = getRandomDie();
    currentDice.push({ type: 'comp', value: val, success: val >= threshold, reRolled: false });
  }
  
  // Glitch die
  if (useGlitch) {
    const val = getRandomDie();
    currentDice.push({ type: 'glitch', value: val, success: val >= threshold, reRolled: false });
  }
  
  renderResults();
}

function rerollLuck() {
  if (!hasRolled) return;

  const threshold = getThreshold();

  currentDice.forEach(die => {
    // Effets acquis : ils verrouillent le dé, qui n'est jamais relancé.
    //  - Complication : Complication ou Imprévu affichant un 1.
    //  - Exploit : Imprévu affichant un 5-6.
    const isAcquiredComplication =
      (die.type === 'comp' || die.type === 'glitch') && die.value === 1;
    const isAcquiredExploit =
      die.type === 'glitch' && die.value >= EXPLOIT_THRESHOLD;
    if (isAcquiredComplication || isAcquiredExploit) {
      die.reRolled = false;
      return;
    }

    // Sinon, la Chance relance TOUS les autres dés (pas seulement les échecs).
    die.value = getRandomDie();
    die.success = die.value >= threshold;
    die.reRolled = true;
  });

  // Un seul point de Chance : on masque le bouton après usage.
  btnReroll.classList.add('hidden');
  renderResults(true);
}

function renderResults(isReroll = false) {
  resultsArea.classList.remove('hidden');
  
  totalSuccesses = currentDice.filter(d => d.success).length;
  
  // Animate numbers
  totalSuccessesEl.textContent = totalSuccesses;
  
  // Clear display
  diceDisplay.innerHTML = '';
  alertsContainer.innerHTML = '';
  
  let hasExploit = false;
  let hasComplication = false;

  currentDice.forEach((die, index) => {
    const dieEl = document.createElement('div');
    dieEl.className = `die ${die.type} ${die.success ? 'success' : 'failure'}`;
    dieEl.textContent = die.value;
    
    // Check effects
    if (die.type === 'glitch') {
      // L'Exploit reste sur un 5-6, même quand la Chance abaisse le seuil de succès.
      if (die.value >= EXPLOIT_THRESHOLD) hasExploit = true;
      if (die.value === 1) hasComplication = true;
    } else if (die.type === 'comp') {
      if (die.value === 1) hasComplication = true;
    }

    // Staggered animation
    dieEl.style.animation = `popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s both`;
    
    diceDisplay.appendChild(dieEl);
  });
  
  // Alerts
  if (hasExploit) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-exploit';
    alert.textContent = '⚡ EXPLOIT ! ⚡';
    alertsContainer.appendChild(alert);
  }
  if (hasComplication) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-complication';
    alert.textContent = '⚠️ COMPLICATION ! ⚠️';
    alertsContainer.appendChild(alert);
  }
  
  // La relance de Chance relance tous les dés : elle est proposée après chaque
  // jet initial, et masquée une fois le point de Chance dépensé.
  if (isReroll) {
    btnReroll.classList.add('hidden');
  } else {
    btnReroll.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
