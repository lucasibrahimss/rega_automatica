# Sistema de Irrigação Inteligente — IoT + AWS + ESP32

Este projeto implementa um sistema completo de irrigação inteligente ("Smart Garden"), integrando um microcontrolador ESP32, serviços de nuvem da AWS e uma interface Web para monitoramento e controle.

**Desenvolvido por:** Lucas Ibrahim

---

## 📋 Visão Geral do Projeto

O objetivo deste sistema é permitir o gerenciamento remoto e automático da irrigação, com as seguintes capacidades:

* **Monitoramento em Tempo Real:** Leitura de umidade do solo via ESP32.
* **Armazenamento de Dados:** Histórico completo de umidade e eventos de rega no AWS DynamoDB.
* **Controle Híbrido:**
    * **Manual:** Acionamento remoto via interface Web (protegido por senha).
    * **Automático:** Decisão autônoma baseada na lógica embarcada no ESP32.
* **Visualização:** Dashboard Web com gráficos históricos e status do sistema.

---

## 🏗️ Arquitetura

O sistema utiliza uma arquitetura baseada em eventos e microsserviços:

1.  **ESP32:** Coleta dados e atua na bomba/válvula. Comunica-se via MQTT.
2.  **AWS IoT Core:** Broker MQTT que gerencia a comunicação e Regras IoT.
3.  **AWS Lambda:** Processa as mensagens recebidas e grava no banco de dados.
4.  **Amazon DynamoDB:** Banco NoSQL para armazenar a tabela `EventosRega`.
5.  **AWS API Gateway:** Expõe os dados do banco para o frontend via API REST.
6.  **Dashboard Web:** Interface SPA hospedada no GitHub Pages.

### Fluxo de Dados
`ESP32` ↔ `AWS IoT Core (MQTT)` → `Regras IoT` → `AWS Lambda` → `DynamoDB`

---

## 📡 Protocolo de Comunicação (MQTT)

O sistema utiliza tópicos MQTT para troca de mensagens entre o ESP32 e a Nuvem.

### 1. Publicação de Umidade (ESP → AWS)
**Tópico:** `rega/automatica/umidade`
Enviado periodicamente pelo ESP32.

```json
{
  "tipo": "UMIDADE",
  "umidade": 72
}
```
### 2. Comando de Rega Manual (Frontend → ESP)Tópico: rega/automatica/comandoEnviado quando o usuário solicita a rega via Web. Requer validação de senha.JSON
```json
{
  "comando": "regar",
  "senha": "1234",
  "origem": "ui"
}
```
### Senha: 
Deve ser validada no firmware do ESP32.origem: "ui" indica comando vindo da interface do usuário.3. Resposta de Rega (ESP → AWS)Tópico: rega/automatica/respostaConfirmação da ação executada pelo ESP32.

Exemplo: Sucesso (Manual)JSON
```json
{
  "status": "sucesso",
  "mensagem": "Rega iniciada",
  "origem": "ui"
}
```
Exemplo: Sucesso (Automático)JSON
```json
{
  "status": "sucesso",
  "mensagem": "reguei",
  "origem": "auto"
}
```
Exemplo: Erro (Senha Incorreta)JSON
```json
{
  "status": "erro",
  "mensagem": "Senha incorreta",
  "origem": "ui"
}
```
### 🗄️ Banco de Dados (DynamoDB)
Os dados são armazenados na tabela EventosRega.
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| **deviceId** | String | ID lógico do dispositivo (ex.: `rega_system`) |
| **timestamp** | Number | Epoch ms (usado para ordenação) |
| **tipo** | String | `UMIDADE`, `COMANDO` ou `RESPOSTA` |
| **umidade** | Number | Valor da umidade (presente se tipo for `UMIDADE`) |
| **comando** | String | Ex.: `regar` (presente se tipo for `COMANDO`) |
| **status** | String | `sucesso` ou `erro` (presente se tipo for `RESPOSTA`) |
| **origem** | String | `ui` (manual) ou `auto` (automática) |
| **modo** | String | Calculado pelo Lambda: `MANUAL` ou `AUTOMÁTICA` |
| **topic** | String | Tópico MQTT original do evento |

## 🌐 API REST (API Gateway)

### Endpoints disponíveis para consumo pelo Frontend:
#### GET
**/getUmidade** - Retorna as últimas 20 leituras de umidade.JSON
```json
{
  "timestamp": 1764624709588,
  "umidade": 68,
  "tipo": "UMIDADE"
}
```
**/getStatusRega** Retorna o histórico de acionamentos (manual e automático).JSON
```json
  {
    "timestamp": 1764630498342,
    "status": "sucesso",
    "modo": "MANUAL",
    "origem": "ui"
  }
```
## 💻 Dashboard Web
O frontend é uma SPA simples desenvolvida em HTML, CSS e JS (Chart.js).

#### Tela 1
**Umidade Atual:** Gauge com valor em tempo real e botão para acionamento manual (com input de senha).

#### Tela 2 
**Histórico de Umidade:** Gráfico de linha (Data/Hora x % Umidade).

#### Tela 3
**Histórico de Rega:** Tabela listando quando a rega ocorreu e qual foi a origem.

## ⚙️ Configuração do Firmware (ESP32)
**Requisitos**
1. Conectar ao Wi-Fi.
2. Conectar ao AWS IoT Core utilizando certificados (CA, Cert, Private Key).
3. Definir ClientID (ex: rega_system).

**Lógica de Controle**
O firmware deve conter a senha correta (ex: "1234") hardcoded ou na memória flash para validação.

**Snippet de Lógica**

*(Pseudo-código C++):C++*

```C++
String SENHA_CORRETA = "1234";
void tratarComando(String senhaRecebida) {
  if (senhaRecebida == SENHA_CORRETA) {
     // 1. Aciona bomba
     // 2. Publica resposta de sucesso (origem: ui)
  } else {
     // 1. Publica resposta de erro
  }
}

void loop() {
  // Lógica Automática
  if (umidade < LIMITE_MINIMO) {
     // Aciona bomba e publica com origem: "auto"
  }
}

```
## 🚀 Instalação e Execução (Frontend)
Para rodar o dashboard localmente:
```bash
1. Clone o repositório
git clone [https://github.com/SEU_USUARIO/SEU_REPO.git](https://github.com/SEU_USUARIO/SEU_REPO.git)
cd SEU_REPO

# 2. Execute um servidor local (ex: usando npx serve ou live-server)
npx serve
# ou
live-server
```
## ✨ Melhorias Futuras (To-Do)
1. Adicionar integração com Alexa.
2. Criar aplicativo Mobile nativo.
3. Implementar atualização via OTA (Over-The-Air) no ESP32.
4. Aprimorar controle automático (PID ou Lógica Fuzzy).