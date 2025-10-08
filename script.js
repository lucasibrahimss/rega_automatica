document.addEventListener('DOMContentLoaded', () => {
    
    // ... (configuração do JustGage continua a mesma) ...
    var gauge = new JustGage({ id: 'gauge', value: 0, min: 0, max: 100, /* ... etc */ });

    // --- Configurações MQTT ---
    const BROKER_URL = 'wss://test.mosquitto.org:8081';
    const TOPIC_LEITURA = 'rega/automatica/umidade';
    const TOPIC_ESCRITA = 'rega/automatica/comando';
    const TOPIC_RESPOSTA = 'rega/automatica/resposta'; // NOVO: Tópico de resposta

    const btnRegar = document.getElementById('btn-regar');
    const senhaInput = document.getElementById('senha');
    
    console.log('Conectando ao broker MQTT...');
    const client = mqtt.connect(BROKER_URL);

    // --- Lógica de Conexão ---
    client.on('connect', () => {
        console.log('Conectado com sucesso ao broker!');
        // Se inscreve nos dois tópicos que precisamos ouvir
        client.subscribe(TOPIC_LEITURA);
        client.subscribe(TOPIC_RESPOSTA); // MODIFICADO: Se inscreve no tópico de resposta
    });

    // --- Lógica para Receber Mensagens ---
    client.on('message', (topic, message) => {
        // Rota para a umidade
        if (topic === TOPIC_LEITURA) {
            const umidade = parseInt(message.toString());
            gauge.refresh(umidade);
        }

        // NOVO: Rota para as respostas do Python
        if (topic === TOPIC_RESPOSTA) {
            const resposta = JSON.parse(message.toString());
            
            // Habilita o botão novamente e volta o texto ao normal
            btnRegar.disabled = false;
            btnRegar.innerText = 'REGAR';

            if (resposta.status === 'sucesso') {
                alert('Rega acionada com sucesso!');
            } else if (resposta.motivo === 'senha_incorreta') {
                alert('Senha incorreta! Tente novamente.');
            } else {
                alert('Ocorreu um erro ao processar o comando.');
            }
        }
    });

    // --- Lógica para Enviar o Comando ---
    btnRegar.addEventListener('click', () => {
        const senhaDigitada = senhaInput.value;
        if (!senhaDigitada) {
            alert('Por favor, digite a senha!');
            return;
        }

        // MODIFICADO: Desabilita o botão e muda o texto para dar feedback visual
        btnRegar.disabled = true;
        btnRegar.innerText = 'ENVIANDO...';

        const payload = {
            comando: 'regar',
            senha: senhaDigitada
        };
        
        client.publish(TOPIC_ESCRITA, JSON.stringify(payload));
        // REMOVIDO: O alert('Comando enviado!') foi removido daqui.
    });
});