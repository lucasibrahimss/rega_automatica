document.addEventListener('DOMContentLoaded', () => {

    var gauge = new JustGage({
        id: 'gauge',
        value: 0,
        min: 0,
        max: 100,
        symbol: '%',
        pointer: true,
        gaugeWidthScale: 0.6,
        counter: true,
        relativeGaugeSize: true,
        levelColors: [
            "#F03E3E",
            "#FFDD00",
            "#30B32D"
        ]
    });

    // --- Lógica MQTT ---
    const BROKER_URL = 'wss://test.mosquitto.org:8081';
    const TOPIC_LEITURA = 'rega/automatica/umidade';
    const TOPIC_ESCRITA = 'rega/automatica/comando';
    const btnRegar = document.getElementById('btn-regar');
    
    console.log('Conectando ao broker MQTT...');
    const client = mqtt.connect(BROKER_URL);

    client.on('connect', () => {
        console.log('Conectado com sucesso ao broker!');
        client.subscribe(TOPIC_LEITURA);
    });

    client.on('message', (topic, message) => {
        if (topic === TOPIC_LEITURA) {
            const umidade = parseInt(message.toString());
            console.log(`Mensagem recebida: ${umidade}%`);
            gauge.refresh(umidade);
        }
    });

    btnRegar.addEventListener('click', () => {
        // MODIFICADO: Agora vamos pegar a senha e montar um JSON
        const senhaInput = document.getElementById('senha');
        const senhaDigitada = senhaInput.value;
    
        if (!senhaDigitada) {
            alert('Por favor, digite a senha!');
            return; // Para a execução se a senha estiver vazia
        }
    
        const payload = {
            comando: 'regar',
            senha: senhaDigitada
        };
        
        // Convertemos o objeto para uma string no formato JSON
        const mensagem = JSON.stringify(payload);
    
        client.publish(TOPIC_ESCRITA, mensagem);
        alert('Comando para regar enviado!');
    });
});