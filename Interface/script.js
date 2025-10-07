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
        client.publish(TOPIC_ESCRITA, 'regar');
        alert('Comando para regar enviado!');
    });
});