import paho.mqtt.client as mqtt
import time
import random

# --- Configurações do Broker MQTT ---
BROKER_ADDRESS = "test.mosquitto.org"
PORT = 1883
TOPIC_UMIDADE = "rega/automatica/umidade"    # Tópico onde publicamos os dados do sensor
TOPIC_COMANDO = "rega/automatica/comando"    # NOVO: Tópico onde ouvimos os comandos
CLIENT_ID = "controlador_rega_automatica"

def on_connect(client, userdata, flags, rc):
    """Função de callback para quando o cliente se conecta ao broker."""
    if rc == 0:
        print("Conectado ao Broker MQTT com sucesso!")
        # MODIFICADO: Se inscreve no tópico de comando ao conectar
        client.subscribe(TOPIC_COMANDO)
        print(f"Inscrito no tópico de comando: {TOPIC_COMANDO}")
    else:
        print(f"Falha ao conectar, código de retorno: {rc}\n")

# NOVA FUNÇÃO: Callback para quando uma mensagem é recebida do broker
def on_message(client, userdata, msg):
    """Processa as mensagens recebidas nos tópicos inscritos."""
    # msg.payload vem em bytes, então decodificamos para string
    comando = msg.payload.decode()
    print(f"Mensagem recebida no tópico '{msg.topic}': {comando}")

    # Verifica se a mensagem é o comando esperado
    if comando == "regar":
        print(">>> COMANDO 'regar' RECEBIDO! Acionando a bomba d'água (simulação)...")
        # Aqui você colocaria o código para acionar o relé/bomba do seu hardware
        time.sleep(5) # Simula a rega por 5 segundos
        print(">>> Rega finalizada.")

def publish_random_humidity(client):
    """Gera um número aleatório e o publica no tópico de umidade."""
    random_value = random.randint(0, 100)
    result = client.publish(TOPIC_UMIDADE, random_value)
    status = result[0]
    if status == 0:
        print(f"Publicado no tópico '{TOPIC_UMIDADE}': {random_value}%")
    else:
        print(f"Falha ao enviar mensagem para o tópico '{TOPIC_UMIDADE}'")

# --- Programa Principal ---
if __name__ == '__main__':
    client = mqtt.Client(client_id=CLIENT_ID)
    
    # MODIFICADO: Associa a nova função de callback de mensagem ao cliente
    client.on_message = on_message
    client.on_connect = on_connect
    
    try:
        client.connect(BROKER_ADDRESS, PORT)
    except Exception as e:
        print(f"Erro ao tentar se conectar ao broker: {e}")
        exit()

    # Inicia o loop de rede em uma thread separada.
    # Isso é CRUCIAL para que o cliente possa ouvir mensagens em segundo plano
    # enquanto o loop principal continua publicando.
    client.loop_start()

    print("Script iniciado. Publicando umidade a cada minuto e ouvindo comandos.")
    try:
        while True:
            publish_random_humidity(client)
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nPrograma interrompido pelo usuário.")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Desconectado do broker.")