const API_URL_STATUS_REGA = "https://q222e5ogma.execute-api.us-east-2.amazonaws.com/prod/status-rega";
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

    // quando entrar na tela de histórico, atualiza o gráfico
    if (targetId === "view-history-humidity") {
      carregarHistoricoUmidade();
    }
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
  if (humidity == null || isNaN(humidity)) return;

  const value = Math.round(humidity);
  humiditySpan.textContent = value;
  const angle = humidityToAngle(value);
  gaugeNeedle.style.transform = `rotate(${angle}deg)`;
}

// ================== Formulário de Rega ==================

const regaForm = document.getElementById("rega-form");
const feedback = document.getElementById("rega-feedback");

const API_COMANDO_URL =
  "https://q222e5ogma.execute-api.us-east-2.amazonaws.com/prod/comando-rega"; // TROCAR AQUI

regaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value.trim();

  if (!password) {
    feedback.textContent = "Digite a senha para enviar o comando de rega.";
    feedback.style.color = "#d9534f";
    return;
  }

  feedback.textContent = "Enviando comando de rega...";
  feedback.style.color = "#333";

  const momentoEnvio = Date.now(); // vamos usar pra ignorar respostas antigas

  try {
    // 1) Envia comando de rega via API (POST)
    const resp = await fetch(API_COMANDO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comando: "regar",
        senha: password,
        origem: "ui",
      }),
    });

    if (!resp.ok) {
      throw new Error("Falha ao chamar API de comando de rega");
    }

    // 2) Começa a esperar pela resposta do ESP (via Dynamo/Status API)
    const resultado = await esperarRespostaRega(momentoEnvio);

    if (resultado.status === "sucesso") {
      feedback.textContent = resultado.mensagem || "Rega iniciada.";
      feedback.style.color = "#26c35c";
    } else if (resultado.status === "erro") {
      feedback.textContent = resultado.mensagem || "Comando rejeitado.";
      feedback.style.color = "#d9534f";
    } else if (resultado.status === "timeout") {
      feedback.textContent = "Sem resposta do dispositivo (timeout).";
      feedback.style.color = "#d9534f";
    } else {
      feedback.textContent = "Status de rega desconhecido.";
      feedback.style.color = "#d9534f";
    }

    passwordInput.value = "";
  } catch (err) {
    console.error(err);
    feedback.textContent = "Erro ao enviar comando de rega.";
    feedback.style.color = "#d9534f";
  }
});

async function esperarRespostaRega(momentoEnvio, timeoutMs = 10000, intervaloMs = 1500) {
  const inicio = Date.now();

  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      const agora = Date.now();

      // se passou do timeout, finaliza
      if (agora - inicio > timeoutMs) {
        clearInterval(timer);
        resolve({ status: "timeout" });
        return;
      }

      try {
        const resp = await fetch(API_URL_STATUS_REGA);
        if (!resp.ok) {
          console.error("Falha ao chamar API de status de rega");
          return;
        }

        const body = await resp.json();
        // body esperado: {status, mensagem, timestamp, origem}

        if (!body || !body.timestamp) {
          return; // nada novo ainda
        }

        // se a resposta é mais antiga que o momento do envio, ignoramos
        if (body.timestamp <= momentoEnvio) {
          return;
        }

        // chegou uma resposta nova!
        clearInterval(timer);
        resolve(body);
      } catch (e) {
        console.error("Erro ao consultar status de rega:", e);
        // não resolve ainda, tenta de novo na próxima iteração
      }
    }, intervaloMs);
  });
}


// ================== Gráfico de Histórico de Umidade (dados reais) ==================

// ⚠️ TROCAR ESSA URL pela URL da sua API Gateway (GET /umidade)
const API_HISTORICO_URL =
  "https://q222e5ogma.execute-api.us-east-2.amazonaws.com/prod/umidade";

let humidityChart;
const ctx = document.getElementById("humidity-chart").getContext("2d");

// cria o gráfico vazio na primeira vez
function initHumidityChartIfNeeded() {
  if (humidityChart) return;

  humidityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Umidade do Solo (%)",
          data: [],
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
      x: {
        title: {
          display: true,
          text: "Data / Hora",
          color: "#333",
          font: {
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        title: {
          display: true,
          text: "% Umidade",
          color: "#333",
          font: {
            size: 12,
            weight: "bold",
          },
        },
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

// Atualiza os dados do gráfico com labels/valores novos
function atualizarHumidityChart(labels, data) {
  initHumidityChartIfNeeded();
  humidityChart.data.labels = labels;
  humidityChart.data.datasets[0].data = data;
  humidityChart.update();
}

// Busca os 20 últimos pontos na API (Lambda + DynamoDB)
async function carregarHistoricoUmidade() {
  try {
    const resp = await fetch(API_HISTORICO_URL);

    if (!resp.ok) {
      console.error("Erro ao buscar histórico:", resp.status, await resp.text());
      return;
    }

    const data = await resp.json(); // [{ timestamp, umidade, tipo }, ...]

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Nenhum dado de umidade retornado pela API.");
      return;
    }

    // Monta labels e valores
    const labels = data.map((item) => {
      // timestamp em milissegundos (pelo que vimos no seu retorno)
      const dt = new Date(item.timestamp);
      return dt.toLocaleTimeString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    });

    const valores = data.map((item) => Number(item.umidade));

    // Atualiza gráfico
    atualizarHumidityChart(labels, valores);

    // Usa o último valor para atualizar o gauge
    const ultimo = data[data.length - 1];
    updateGauge(ultimo.umidade);
  } catch (err) {
    console.error("Erro no fetch do histórico:", err);
  }
}

// ================== Tabela de Histórico de Rega (ainda fake, por enquanto) ==================

const API_HIST_REGA =
  "https://q222e5ogma.execute-api.us-east-2.amazonaws.com/prod/historico-rega"; 
 
// ---------- Histórico de Rega (dados reais) ----------

const regaTableBody = document.getElementById("rega-table-body");

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

async function fetchHistoricoRega() {
  try {
    const resp = await fetch(API_HIST_REGA);
    if (!resp.ok) throw new Error("HTTP " + resp.status);

    const data = await resp.json(); // [{timestamp, status, origem, modo, ...}]

    const eventos = data.map((item) => {
      const d = new Date(item.timestamp);
      const date = d.toLocaleDateString("pt-BR");
      const time = d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Mostra diretamente "Manual" / "Automática"
      const source =
        item.modo === "MANUAL" || item.modo === "AUTOMÁTICA"
          ? item.modo
          : item.origem === "ui" || item.origem === "ui_web"
          ? "MANUAL"
          : "AUTOMÁTICA";

      return {
        date,
        time,
        source,                // coluna Origem/Source
        status: item.status || "",
      };
    });

    renderRegaTable(eventos);
  } catch (err) {
    console.error("Erro ao buscar histórico de rega:", err);
  }
}

// Carrega no início
fetchHistoricoRega();

// Opcional: atualizar a cada 30s
setInterval(fetchHistoricoRega, 1000);


// ================== Inicialização ==================

// Quando a página carregar, já busca o histórico uma vez
document.addEventListener("DOMContentLoaded", () => {
  carregarHistoricoUmidade();

  // Se quiser atualizar automaticamente de tempos em tempos:
   setInterval(carregarHistoricoUmidade, 1000); // a cada 60 s
});
