// ================== Navegação entre "páginas" ==================

const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;

    // ativa botão
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // ativa view
    views.forEach((v) => {
      v.classList.toggle("active", v.id === targetId);
    });
  });
});

// ================== Gauge de Umidade ==================

const humiditySpan = document.getElementById("humidity-value");
const gaugeNeedle = document.getElementById("gauge-needle");

// Converte 0–100% para ângulo -90 a 90 graus
function humidityToAngle(h) {
  const clamped = Math.min(100, Math.max(0, h));
  return (clamped / 100) * 180 - 90;
}

// Atualiza valor do gauge
function updateGauge(humidity) {
  humiditySpan.textContent = humidity;
  const angle = humidityToAngle(humidity);
  gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

// ====== Simulação: atualiza umidade a cada 5s (depois você troca por dados reais) ======
function simulateHumidity() {
  const randomHumidity = Math.floor(Math.random() * 101);
  updateGauge(randomHumidity);
}
simulateHumidity();
setInterval(simulateHumidity, 5000);

// ================== Formulário de Rega ==================

const regaForm = document.getElementById("rega-form");
const feedback = document.getElementById("rega-feedback");

regaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value.trim();

  // aqui você pode validar a senha real
  if (!password) {
    feedback.textContent = "Digite a senha para enviar o comando de rega.";
    feedback.style.color = "#d9534f";
    return;
  }

  // TODO: aqui vai a integração real com AWS IoT (publicar comando via API/Lambda)
  console.log("Enviando comando de REGA com senha:", password);

  feedback.textContent = "Comando de rega enviado (simulado).";
  feedback.style.color = "#26c35c";
  passwordInput.value = "";
});

// ================== Gráfico de Histórico de Umidade ==================

let humidityChart;
const ctx = document.getElementById("humidity-chart").getContext("2d");

// Dados simulados (substituir depois por leitura do DynamoDB)
function generateDummyHistory() {
  const labels = [];
  const data = [];
  const now = Date.now();

  for (let i = 10; i >= 0; i--) {
    const time = new Date(now - i * 5 * 60 * 1000); // a cada 5 minutos
    labels.push(
      time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
    data.push(40 + Math.round(Math.sin(i / 2) * 20 + (Math.random() * 15 - 7)));
  }

  return { labels, data };
}

function initHumidityChart() {
  const { labels, data } = generateDummyHistory();

  humidityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Umidade do Solo (%)",
          data,
          borderColor: "#26c35c",
          backgroundColor: "rgba(38, 195, 92, 0.10)",
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#1ea24c",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

initHumidityChart();

// ================== Tabela de Histórico de Rega ==================

const regaTableBody = document.getElementById("rega-table-body");

// Dados fake de histórico
const dummyRegaEvents = [
  {
    date: "01/12/2025",
    time: "18:35",
    source: "UI",
    status: "Executada",
  },
  {
    date: "01/12/2025",
    time: "18:20",
    source: "Control System",
    status: "Automática",
  },
  {
    date: "01/12/2025",
    time: "17:40",
    source: "UI",
    status: "Cancelada",
  },
];

function renderRegaTable(events) {
  regaTableBody.innerHTML = "";

  events.forEach((ev) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${ev.date}</td>
      <td>${ev.time}</td>
      <td>${ev.source}</td>
      <td>${ev.status}</td>
    `;

    regaTableBody.appendChild(tr);
  });
}

renderRegaTable(dummyRegaEvents);

// ================== Hooks para futuro backend ==================
//
// - updateGauge(humidity) -> atualizar umidade instantânea
// - humidityChart.data.labels / .data.datasets[0].data -> atualizar histórico
// - renderRegaTable(listaDeEventos) -> atualizar histórico de rega
//
// Quando você tiver as APIs prontas (ex: Gateway + Lambda lendo do Dynamo),
// basta chamar essas funções com os dados reais.
