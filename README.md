<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Sistema de Irrigação Inteligente — IoT + AWS + ESP32</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Fonte Google -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <style>
    :root {
      --bg: #f4fbf6;
      --card-bg: #ffffff;
      --primary: #26c35c;
      --primary-dark: #1ea24c;
      --accent: #ff4b5c;
      --text-main: #222831;
      --text-muted: #6c757d;
      --code-bg: #0f172a;
      --code-border: #1e293b;
      --badge-bg: #e8fff0;
      --border-soft: #dde5e9;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top, #d5ffe5 0, #f4fbf6 40%, #f9fafb 100%);
      color: var(--text-main);
      line-height: 1.6;
      padding: 2rem 1rem 4rem;
    }

    .container {
      max-width: 980px;
      margin: 0 auto;
    }

    /* Cabeçalho */
    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    header h1 {
      font-size: 2.4rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 700;
    }

    header h1 span {
      color: var(--primary);
    }

    header p {
      margin-top: 0.6rem;
      color: var(--text-muted);
      font-size: 0.98rem;
    }

    .tagline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--badge-bg);
      color: var(--primary-dark);
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-top: 0.8rem;
    }

    .tagline span.icon {
      font-size: 1.1rem;
    }

    /* Seções */
    section {
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 0.8rem;
      margin-top: 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    h2 .icon {
      font-size: 1.25rem;
    }

    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.45rem;
      margin-top: 1rem;
    }

    p {
      font-size: 0.95rem;
      color: var(--text-main);
      margin-bottom: 0.4rem;
    }

    ul {
      padding-left: 1.2rem;
      margin: 0.3rem 0 0.5rem;
      font-size: 0.94rem;
    }

    li {
      margin-bottom: 0.2rem;
    }

    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 1.4rem 1.6rem;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.07);
      border: 1px solid rgba(148, 163, 184, 0.25);
      margin-bottom: 1.2rem;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.16rem 0.7rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #e0f2fe;
      color: #0f172a;
    }

    .pill.green {
      background: #dcfce7;
      color: #14532d;
    }

    .pill.red {
      background: #fee2e2;
      color: #7f1d1d;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-top: 0.4rem;
      margin-bottom: 0.5rem;
    }

    /* Tabelas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.4rem;
      font-size: 0.88rem;
    }

    th, td {
      padding: 0.45rem 0.5rem;
      border-bottom: 1px solid var(--border-soft);
      text-align: left;
    }

    th {
      background: #e4ffe8;
      font-weight: 600;
      font-size: 0.82rem;
    }

    tr:nth-child(even) td {
      background: #f9fafb;
    }

    /* Código */
    pre {
      background: var(--code-bg);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      overflow-x: auto;
      border: 1px solid var(--code-border);
      margin-top: 0.5rem;
      margin-bottom: 0.6rem;
    }

    pre code {
      font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.82rem;
      color: #e5e7eb;
      white-space: pre;
    }

    code.inline {
      background: #0f172a;
      color: #e5e7eb;
      font-size: 0.8rem;
      padding: 0.05rem 0.3rem;
      border-radius: 6px;
    }

    /* Layout de colunas */
    .grid-2 {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
      gap: 1.2rem;
    }

    @media (max-width: 768px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }

      header h1 {
        font-size: 1.8rem;
      }
    }

    .footer {
      margin-top: 2rem;
      font-size: 0.8rem;
      text-align: center;
      color: var(--text-muted);
    }

    .footer a {
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Rega <span>Automática</span></h1>
      <p>Sistema de Irrigação Inteligente — ESP32 • AWS IoT Core • Lambda • DynamoDB • API Gateway • Dashboard Web</p>
      <div class="tagline">
        <span class="icon">🌱</span>
        IoT + Nuvem + Automação de Rega com Histórico Completo
      </div>
    </header>

    <!-- Visão Geral -->
    <section id="overview" class="card">
      <h2><span class="icon">📌</span> Visão Geral do Projeto</h2>
      <p>
        Este projeto implementa um sistema completo de irrigação inteligente, capaz de:
      </p>
      <ul>
        <li>Monitorar a umidade do solo em tempo real (ESP32 + sensor de umidade)</li>
        <li>Armazenar leituras e eventos de rega no <strong>DynamoDB</strong></li>
        <li>Permitir <strong>rega manual</strong> via interface Web com senha</li>
        <li>Executar <strong>rega automática</strong> de acordo com a lógica embarcada no ESP32</li>
        <li>Exibir <strong>gráfico histórico</strong> de umidade e <strong>histórico de ações de rega</strong></li>
      </ul>

      <div class="badge-row">
        <span class="pill green">ESP32</span>
        <span class="pill green">AWS IoT Core (MQTT)</span>
        <span class="pill">AWS Lambda</span>
        <span class="pill">Amazon DynamoDB</span>
        <span class="pill">AWS API Gateway</span>
        <span class="pill">Dashboard Web (GitHub Pages)</span>
      </div>
    </section>

    <!-- Arquitetura -->
    <section class="card">
      <h2><span class="icon">🏗️</span> Arquitetura Geral</h2>
      <pre><code>
[ ESP32 ]
   ├─ Lê a umidade do solo
   ├─ Decide rega automática
   ├─ Recebe comando de rega manual (senha)
   ├─ Aciona bomba / válvula solenoide
   └─ Publica e assina tópicos MQTT

          │
          ▼
   AWS IoT Core  ──(Regras IoT)──► AWS Lambda
          │                           │
          │                           ▼
          │                     DynamoDB (EventosRega)
          │
          ▼
   API Gateway ──► Lambdas REST ──► Dashboard Web (GitHub Pages)
      </code></pre>
    </section>

    <!-- Tópicos MQTT -->
    <section class="card">
      <h2><span class="icon">📡</span> Tópicos MQTT Oficiais</h2>

      <h3>1️⃣ Publicação de Umidade (ESP ➜ AWS)</h3>
      <p><code class="inline">rega/automatica/umidade</code></p>
      <p>Payload enviado pelo ESP32 a cada leitura de umidade:</p>
      <pre><code>{
  "tipo": "UMIDADE",
  "umidade": 72
}</code></pre>

      <h3>2️⃣ Comando de Rega Manual (Frontend ➜ ESP)</h3>
      <p><code class="inline">rega/automatica/comando</code></p>
      <p>Payload publicado pelo frontend quando o usuário clica em <strong>REGAR</strong> e informa a senha:</p>
      <pre><code>{
  "comando": "regar",
  "senha": "1234",
  "origem": "ui"
}</code></pre>

      <ul>
        <li><strong>senha</strong>: deve ser validada no ESP32 (definida no firmware).</li>
        <li><strong>origem = "ui"</strong>: identifica que a origem do comando é a interface Web.</li>
      </ul>

      <h3>3️⃣ Resposta de Rega (ESP ➜ AWS)</h3>
      <p><code class="inline">rega/automatica/resposta</code></p>

      <h4>✔ Rega manual (senha correta):</h4>
      <pre><code>{
  "status": "sucesso",
  "mensagem": "Rega iniciada",
  "origem": "ui"
}</code></pre>

      <h4>✔ Rega automática (decisão do próprio ESP):</h4>
      <pre><code>{
  "status": "sucesso",
  "mensagem": "reguei",
  "origem": "auto"
}</code></pre>

      <h4>❌ Senha incorreta (manual):</h4>
      <pre><code>{
  "status": "erro",
  "mensagem": "Senha incorreta",
  "origem": "ui"
}</code></pre>
    </section>

    <!-- DynamoDB -->
    <section class="card">
      <h2><span class="icon">🗃️</span> Tabela DynamoDB: <code class="inline">EventosRega</code></h2>
      <p>Todos os eventos importantes (umidade, comandos e respostas) são armazenados na tabela <code class="inline">EventosRega</code>.</p>

      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Tipo</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>deviceId</code></td>
            <td>String</td>
            <td>ID lógico do dispositivo (ex.: <code>rega_system</code>)</td>
          </tr>
          <tr>
            <td><code>timestamp</code></td>
            <td>Number</td>
            <td>Epoch ms (usado como ordenação dos eventos)</td>
          </tr>
          <tr>
            <td><code>tipo</code></td>
            <td>String</td>
            <td><code>UMIDADE</code>, <code>COMANDO</code> ou <code>RESPOSTA</code></td>
          </tr>
          <tr>
            <td><code>umidade</code></td>
            <td>Number</td>
            <td>Presente para eventos de tipo <code>UMIDADE</code></td>
          </tr>
          <tr>
            <td><code>comando</code></td>
            <td>String</td>
            <td>Ex.: <code>regar</code> (para tipo <code>COMANDO</code>)</td>
          </tr>
          <tr>
            <td><code>status</code></td>
            <td>String</td>
            <td><code>sucesso</code> ou <code>erro</code> (para tipo <code>RESPOSTA</code>)</td>
          </tr>
          <tr>
            <td><code>origem</code></td>
            <td>String</td>
            <td><code>ui</code> (manual) ou <code>auto</code> (automática)</td>
          </tr>
          <tr>
            <td><code>modo</code></td>
            <td>String</td>
            <td><code>MANUAL</code> ou <code>AUTOMÁTICA</code>, calculado pelo Lambda</td>
          </tr>
          <tr>
            <td><code>topic</code></td>
            <td>String</td>
            <td>Tópico MQTT original do evento</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- API -->
    <section class="card">
      <h2><span class="icon">🌐</span> API REST (API Gateway)</h2>

      <div class="grid-2">
        <div>
          <h3>GET <code class="inline">/getUmidade</code></h3>
          <p>Retorna as <strong>20 últimas leituras</strong> de umidade.</p>
          <pre><code>[
  {
    "timestamp": 1764624709588,
    "umidade": 68,
    "tipo": "UMIDADE"
  }
]</code></pre>
        </div>

        <div>
          <h3>GET <code class="inline">/getStatusRega</code></h3>
          <p>Retorna o histórico de rega (manual/automática), incluindo origem e status.</p>
          <pre><code>[
  {
    "timestamp": 1764630498342,
    "status": "sucesso",
    "modo": "MANUAL",
    "origem": "ui"
  }
]</code></pre>
        </div>
      </div>
    </section>

    <!-- Frontend -->
    <section class="card">
      <h2><span class="icon">💻</span> Dashboard Web</h2>
      <p>O frontend é uma SPA simples em HTML/CSS/JS (Chart.js) e é hospedado no GitHub Pages.</p>

      <ul>
        <li><strong>Tela 1 – Umidade Atual:</strong> gauge com valor atual + botão de rega manual (senha)</li>
        <li><strong>Tela 2 – Histórico de Umidade:</strong> gráfico de linha com Data/Hora × %Umidade</li>
        <li><strong>Tela 3 – Histórico de Rega:</strong> tabela com Data, Hora, Origem (Manual/Automática) e Status</li>
      </ul>

      <h3>Rodar localmente</h3>
      <pre><code># usando npx serve
npx serve .

# ou usando live-server
npm install -g live-server
live-server .
</code></pre>
    </section>

    <!-- Manual ESP32 -->
    <section class="card">
      <h2><span class="icon">🔧</span> Guia Rápido para Programar o ESP32</h2>

      <h3>1. Conexão principal</h3>
      <ul>
        <li>Conectar à rede Wi-Fi</li>
        <li>Conectar ao AWS IoT Core com certificados (CA, cert, key)</li>
        <li>Configurar o ClientID (ex.: <code class="inline">"rega_system"</code>)</li>
      </ul>

      <h3>2. Tópicos que o ESP32 deve <strong>assinar</strong></h3>
      <ul>
        <li><code class="inline">rega/automatica/comando</code> – recebe comandos com senha da interface web.</li>
      </ul>

      <h3>3. Tópicos que o ESP32 deve <strong>publicar</strong></h3>
      <ul>
        <li><code class="inline">rega/automatica/umidade</code> – envia leituras periódicas.</li>
        <li><code class="inline">rega/automatica/resposta</code> – envia status da rega (manual/automática).</li>
      </ul>

      <h3>4. Senha de Rega</h3>
      <p>
        A senha correta é armazenada e verificada <strong>no próprio ESP32</strong>.
        Exemplo em C++:
      </p>
      <pre><code>String SENHA_CORRETA = "1234";  // definir no firmware

void tratarComando(String senhaRecebida) {
  if (senhaRecebida == SENHA_CORRETA) {
    // aciona bomba, publica resposta de sucesso
  } else {
    // publica resposta de erro (senha incorreta)
  }
}</code></pre>

      <h3>5. Lógica recomendada no ESP32</h3>
      <ul>
        <li>Ler periodicamente a umidade e publicar em <code class="inline">rega/automatica/umidade</code>.</li>
        <li>Ao receber um comando em <code class="inline">rega/automatica/comando</code>:
          <ul>
            <li>Validar <code class="inline">senha</code>.</li>
            <li>Se correta → acionar bomba → publicar resposta com <code class="inline">origem = "ui"</code>.</li>
          </ul>
        </li>
        <li>Para rega automática (sem interação da UI):
          <ul>
            <li>Se umidade &lt; limite → acionar bomba → publicar resposta com <code class="inline">origem = "auto"</code>.</li>
          </ul>
        </li>
      </ul>
    </section>

    <!-- Instalação / Contribuição -->
    <section class="card">
      <h2><span class="icon">📦</span> Instalação & Execução Rápida</h2>
      <pre><code># clonar o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO

# abrir o index.html no navegador ou servir localmente
npx serve .
</code></pre>

      <h3>Contribuições</h3>
      <p>Sugestões, melhorias e PRs são super bem-vindos 💚</p>
      <ul>
        <li>Adicionar integração com Alexa</li>
        <li>Criar app mobile</li>
        <li>Adicionar OTA no ESP32</li>
        <li>Aprimorar controle automático (PID, lógica fuzzy, etc.)</li>
      </ul>
    </section>

    <div class="footer">
      Desenvolvido com ☕ e 🌱 por <a href="#">Lucas Ibrahim</a>.  
      Este documento pode ser usado como README ou página de documentação do projeto.
    </div>
  </div>
</body>
</html>
