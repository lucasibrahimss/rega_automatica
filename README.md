🌱 Sistema de Irrigação Inteligente — IoT + AWS + ESP32

Este projeto implementa um sistema de irrigação inteligente completo utilizando:

ESP32

MQTT (AWS IoT Core)

DynamoDB

AWS Lambda

AWS API Gateway

Dashboard Web (GitHub Pages)

O sistema permite monitorar a umidade do solo em tempo real, exibir histórico de leituras, solicitar rega manual via interface web e acionar rega automática quando necessário.

🚀 Arquitetura Geral
[ ESP32 ] 
   │ lê umidade / aciona bomba
   ▼
AWS IoT Core (MQTT)
   │ tópicos de telemetria e comando
   ▼
AWS Lambda (IoT Rule)
   │ grava tudo no DynamoDB
   ▼
Tabela DynamoDB: EventosRega
   │ histórico completo
   ▼
AWS API Gateway + Lambda
   │ expõem dados para o frontend
   ▼
Dashboard Web (GitHub Pages)

📡 Tópicos MQTT Oficiais

O sistema utiliza três tópicos padronizados:

📤 1. Publicação de Umidade (ESP → AWS)

rega/automatica/umidade

Payload:

{
  "tipo": "UMIDADE",
  "umidade": 72
}

📥 2. Comando de Rega Manual (Frontend → AWS → ESP)

rega/automatica/comando

Payload:

{
  "comando": "regar",
  "senha": "1234",
  "origem": "ui"
}


O ESP valida a senha que está armazenada nele.

📤 3. Resposta da Rega (ESP → AWS)

rega/automatica/resposta

Rega manual correta
{
  "status": "sucesso",
  "mensagem": "Rega iniciada",
  "origem": "ui"
}

Rega automática
{
  "status": "sucesso",
  "mensagem": "reguei",
  "origem": "auto"
}

🧠 Fluxo de Funcionamento
1. Rega Manual

Usuário clica em "Regar" no dashboard

Front-end → API → AWS IoT Core → ESP

ESP valida senha

ESP aciona a bomba

ESP publica resposta no tópico /resposta

Lambda registra no DynamoDB

Dashboard mostra no histórico

2. Rega Automática

ESP lê umidade periodicamente

Se abaixo de um limiar → inicia rega por conta própria

Publica resposta "origem": "auto"

DynamoDB registra

Dashboard mostra tipo AUTOMÁTICA

🗃 Estrutura do DynamoDB

Tabela: EventosRega

Campo	Tipo	Descrição
deviceId	String	Sempre "rega_system"
timestamp	Number	PK secundária (ordenado)
tipo	String	UMIDADE / COMANDO / RESPOSTA
umidade	Number	(se tipo = UMIDADE)
comando	String	(se tipo = COMANDO)
status	String	(se tipo = RESPOSTA)
origem	String	ui ou auto
topic	String	tópico MQTT de origem
🌐 Endpoints da API
/getUmidade

Retorna as últimas 20 medições de umidade.

Exemplo de resposta:

[
  { "timestamp": 1764624709588, "umidade": 68, "tipo": "UMIDADE" },
  ...
]

/getStatusRega

Retorna histórico das ações de rega.

Resposta:

[
  {
    "timestamp": 1764630498342,
    "status": "sucesso",
    "modo": "MANUAL",
    "origem": "ui"
  }
]

💻 Frontend (GitHub Pages)

O front-end exibe:

Gauge de umidade

Histórico em gráfico (Chart.js)

Tabela de regas (manual/automática)

Botão para comandar rega manual

Atualização automática via API a cada 30s

Para rodar localmente:

npx serve .


Ou apenas abra com LiveServer no VSCode.

🔧 Montagem e Programação do ESP32

O ESP deve:

✔ Conectar ao AWS IoT usando certificados
✔ Publicar umidade no tópico certo
✔ Assinar comandos de rega
✔ Validar senha
✔ Acionar a bomba
✔ Publicar resposta da rega
✔ Criar lógica automática baseada na umidade

Senha deve ser definida no firmware, exemplo:

String SENHA_CORRETA = "1234";

📦 Instalação e Deploy
1. Clone o repositório
git clone https://github.com/...
cd irrigacao-inteligente

2. Instale dependências do front (se houver)
npm install

3. Deploy no GitHub Pages

Basta subir o conteúdo da pasta /docs ou /site.

🧪 Testando MQTT

Use ferramentas como:

MQTT Explorer

MQTTX

mosquitto_sub/pub

Exemplo para teste:

mosquitto_pub -h a24u41r2ko6uba-ats.iot.us-east-2.amazonaws.com \
 -p 8883 --cafile AmazonRootCA1.pem \
 --cert device.crt --key device.key \
 -t "rega/automatica/comando" \
 -m '{"comando":"regar","senha":"1234","origem":"ui"}'

👨‍💻 Contribuição

Pull requests são bem-vindos!
Se quiser adicionar:

App mobile

Autenticação Cognito

Suporte à Alexa

OTA no ESP32

basta abrir uma issue!

📄 Licença

MIT — livre para uso acadêmico ou comercial.
