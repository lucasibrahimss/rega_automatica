import json
import time
import paho.mqtt.client as mqtt
import random

# --- Configurações do Broker MQTT ---
BROKER_ADDRESS = "test.mosquitto.org"
PORT = 1883
TOPIC_UMIDADE = "rega/automatica/umidade"
TOPIC_COMANDO = "rega/automatica/comando"
TOPIC_RESPOSTA = "rega/automatica/resposta" # NOVO: Tópico para as respostas

SENHA_SECRETA = "meuTomateFeliz123"

def on_connect(client, userdata, flags, rc):
    """Callback de conexão."""
    if rc == 0:
        print("Conectado ao Broker MQTT com sucesso!")
        client.subscribe(TOPIC_COMANDO)
        print(f"Inscrito no tópico de comando: {TOPIC_COMANDO}")
    else:
        print(f"Falha ao conectar, código de retorno: {rc}\n")

def on_message(client, userdata, msg):
    """Callback para processar mensagens recebidas."""
    if msg.topic == TOPIC_COMANDO:
        try:
            data = json.loads(msg.payload.decode())
            comando = data.get("comando")
            senha_recebida = data.get("senha")
            
            # Prepara uma resposta padrão de falha
            resposta = {"status": "falha", "motivo": "senha_incorreta"}

            if senha_recebida == SENHA_SECRETA:
                print("Senha correta!")
                if comando == "regar":
                    print(">>> COMANDO 'regar' VÁLIDO RECEBIDO! Acionando a bomba d'água...")
                    # Lógica para acionar a rega aqui
                    time.sleep(5)
                    print(">>> Rega finalizada.")
                    # MODIFICADO: A resposta agora é de sucesso
                    resposta = {"status": "sucesso", "mensagem": "Rega acionada!"}
            else:
                print("!!! Senha incorreta recebida. Comando ignorado. !!!")

            # MODIFICADO: Publica a resposta no novo tópico
            client.publish(TOPIC_RESPOSTA, json.dumps(resposta))

        except Exception as e:
            print(f"Ocorreu um erro ao processar o comando: {e}")

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
    client = mqtt.Client(client_id="controlador_rega_python_feedback")
    client.on_message = on_message
    client.on_connect = on_connect
    
    client.connect(BROKER_ADDRESS, PORT)
    client.loop_start()

    print("Script iniciado. Publicando umidade e ouvindo comandos.")
    try:
        while True:
            publish_random_humidity(client)
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nPrograma interrompido.")
    finally:
        client.loop_stop()
        client.disconnect()