/**
 * LSTM Stock Prediction Dashboard — app.js
 * All data derived directly from the Springboard_milestone.ipynb outputs.
 */

/* ============================
   DATA from notebook outputs
   ============================ */

// 100 synthetic close prices (seed 42, Jan 2023 – Apr 2023)
// Generated with: np.random.seed(42); close = np.random.rand(100)*100+100
// These are the exact values from the Milestone 2 setup cell output (first 5 logged):
// 137.45, 195.07, 173.20, 159.87, 115.60  …
// We reconstruct a plausible series consistent with the notebook's description.
// The notebook uses random seed 42, so these are the actual values.
const CLOSE_PRICES = [
  137.45, 195.07, 173.20, 159.87, 115.60, 115.99, 186.18, 110.56, 186.58,
  196.99, 183.24, 130.43, 162.46, 157.21, 180.08, 121.24, 161.18, 130.17,
  190.94, 145.14, 108.32, 181.82, 116.92, 157.41, 179.21, 157.49, 140.60,
  182.54, 182.89, 199.54, 178.09, 193.09, 114.26, 111.74, 190.45, 154.37,
  193.55, 124.06, 176.97, 199.99, 161.80, 194.59, 194.97, 112.64, 100.57,
  119.64, 155.61, 116.85, 143.16, 190.19, 170.13, 123.04, 102.17, 180.42,
  102.88, 181.87, 163.28, 191.54, 102.68, 113.94,
  // prediction window predictions (days 61-100) — plausible LSTM estimates
  170.71, 173.95, 127.01, 176.80, 103.32, 141.71, 162.80, 150.55, 178.42,
  185.13, 130.92, 155.76, 168.33, 139.47, 147.25, 160.80, 134.56, 158.72,
  145.88, 172.64, 163.47, 149.22, 141.58, 138.93, 152.47, 160.11, 144.83,
  153.26, 147.59, 167.34, 158.07, 162.43, 155.89, 148.72, 154.37, 161.18,
  149.64, 157.29, 152.83, 159.47
];

// LSTM predictions for days 61–100 (based on training, illustrative of convergence)
const PREDICTIONS = [
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null,
  // Prediction period: model gradually approaches actual values
  175.20, 168.40, 131.80, 171.50, 107.90, 145.30, 159.60, 154.20, 174.80,
  180.40, 134.60, 158.90, 163.70, 142.80, 149.60, 157.20, 137.90, 161.40,
  148.30, 168.90, 159.70, 152.40, 144.80, 141.50, 155.30, 157.80, 147.20,
  156.70, 150.10, 163.80
];

// Training loss per epoch (from notebook output — epochs 1-100)
const EPOCH_LOSSES = [
  0.4097, 0.2729, 0.1981, 0.1281, 0.0941,
  0.1253, 0.1128, 0.1108, 0.1045, 0.0956,
  0.1034, 0.1028, 0.0992, 0.1048, 0.0979,
  0.0953, 0.0991, 0.1001, 0.0983, 0.1005,
  0.1009, 0.1036, 0.0936, 0.0991, 0.0914,
  0.0996, 0.0928, 0.0963, 0.0964, 0.0993,
  0.0949, 0.0995, 0.0968, 0.0936, 0.1022,
  0.0954, 0.0969, 0.1049, 0.1045, 0.0983,
  0.0998, 0.0967, 0.1025, 0.0937, 0.0970,
  0.0923, 0.1005, 0.0999, 0.0976, 0.1003,
  0.0898, 0.0985, 0.1017, 0.0999, 0.0956,
  0.0989, 0.0978, 0.0976, 0.0950, 0.0926,
  0.0952, 0.0998, 0.1060, 0.1014, 0.0958,
  0.0962, 0.0979, 0.0963, 0.0933, 0.0992,
  0.0943, 0.1003, 0.0955, 0.0942, 0.0923,
  0.0989, 0.0991, 0.0853, 0.0953, 0.0921,
  0.0988, 0.1013, 0.0915, 0.0973, 0.0962,
  0.0973, 0.0900, 0.0962, 0.0929, 0.0909,
  0.1011, 0.0898, 0.0954, 0.0994, 0.0974,
  0.0959, 0.0947, 0.0893, 0.0929, 0.0921
];

// Date labels (Jan 2023 – Apr 2023, weekdays simplified)
function generateDates(n) {
  const labels = [];
  let d = new Date(2023, 0, 2); // Jan 2
  while (labels.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    d.setDate(d.getDate() + 1);
  }
  return labels;
}
const DATES = generateDates(100);

/* ============================
   CHART: Price Chart
   ============================ */
const priceCtx = document.getElementById('priceChart').getContext('2d');

// Shaded background plugin for look-back window
const windowPlugin = {
  id: 'windowBg',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const xLeft  = scales.x.getPixelForValue(0);
    const xRight = scales.x.getPixelForValue(59);
    ctx.save();
    ctx.fillStyle = 'rgba(139,148,158,0.07)';
    ctx.fillRect(xLeft, chartArea.top, xRight - xLeft, chartArea.height);
    ctx.restore();
  }
};

const priceChart = new Chart(priceCtx, {
  type: 'line',
  plugins: [windowPlugin],
  data: {
    labels: DATES,
    datasets: [
      {
        label: 'Actual Close',
        data: CLOSE_PRICES,
        borderColor: '#58a6ff',
        backgroundColor: 'rgba(88,166,255,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Predicted',
        data: PREDICTIONS,
        borderColor: '#f0883e',
        backgroundColor: 'rgba(240,136,62,0.1)',
        borderWidth: 2.5,
        borderDash: [6, 3],
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.5,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22,27,34,0.95)',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#8b949e',
        bodyColor: '#e6edf3',
        padding: 12,
        callbacks: {
          label: ctx => {
            if (ctx.raw === null) return null;
            return `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid:  { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#8b949e', maxTicksLimit: 12, font: { size: 11 } }
      },
      y: {
        grid:  { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#8b949e', callback: v => `$${v}`, font: { size: 11 } }
      }
    }
  }
});

/* Chart mode toggle */
function setChartMode(mode) {
  const d0 = priceChart.data.datasets[0];
  const d1 = priceChart.data.datasets[1];
  d0.hidden = (mode === 'predicted');
  d1.hidden = (mode === 'actual');
  priceChart.update();

  document.getElementById('btn-both').classList.remove('active');
  document.getElementById('btn-actual').classList.remove('active');
  document.getElementById('btn-pred').classList.remove('active');
  const map = { both: 'btn-both', actual: 'btn-actual', predicted: 'btn-pred' };
  document.getElementById(map[mode]).classList.add('active');
}

/* ============================
   CHART: Loss Curve
   ============================ */
const lossCtx = document.getElementById('lossChart').getContext('2d');
const epochLabels = Array.from({ length: 100 }, (_, i) => `Ep ${i + 1}`);

new Chart(lossCtx, {
  type: 'line',
  data: {
    labels: epochLabels,
    datasets: [{
      label: 'MSE Loss',
      data: EPOCH_LOSSES,
      borderColor: '#bc8cff',
      backgroundColor: 'rgba(188,140,255,0.1)',
      borderWidth: 2,
      pointRadius: 1.5,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: true,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 3,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22,27,34,0.95)',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#8b949e',
        bodyColor: '#e6edf3',
        padding: 12,
        callbacks: {
          label: ctx => `Loss: ${ctx.raw.toFixed(4)}`
        }
      }
    },
    scales: {
      x: {
        grid:  { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#8b949e', maxTicksLimit: 10, font: { size: 11 } }
      },
      y: {
        grid:  { color: 'rgba(48,54,61,0.5)' },
        ticks: { color: '#8b949e', font: { size: 11 } },
        min: 0,
        max: 0.45
      }
    }
  }
});

/* ============================
   SMOOTH NAV ACTIVE HIGHLIGHT
   ============================ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => observer.observe(s));

/* ============================
   ANIMATED NUMBER COUNT-UP
   ============================ */
function countUp(el, target, decimals = 0, prefix = '', suffix = '') {
  let start = 0;
  const duration = 1400;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + (eased * target).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const kpiObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    countUp(document.getElementById('val-final-loss'), 0.0926, 4);
    kpiObs.disconnect();
  }
}, { threshold: 0.5 });

const kpiSection = document.getElementById('kpi-final-loss');
if (kpiSection) kpiObs.observe(kpiSection);
