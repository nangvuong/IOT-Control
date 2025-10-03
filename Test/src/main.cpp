#include <Arduino.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <BH1750.h>
#include <EEPROM.h>

// Định nghĩa chân GPIO điều khiển các thiết bị ngoại vi
#define LED_ D5
#define FAN_ D6
#define MUSIC_ D7
#define DHTPIN D1
#define DHTTYPE DHT11
#define SDA D2
#define SCL D3

// Thông tin đăng nhập Wi-Fi và MQTT broker
const char* ssid = "iPhone’s Vuong";
const char* pass = "1597537410";
const char* mqtt_server = "Macs-Vuong.local";
const char* mqtt_user = "admin";             
const char* mqtt_pass = "2707"; 

// Khởi tạo cảm biến nhiệt độ/độ ẩm và cảm biến ánh sáng
DHT dht(DHTPIN, DHTTYPE);
BH1750 bh1750;

// Tạo client MQTT dựa trên kết nối Wi-Fi
WiFiClient wifiConnect;
PubSubClient client(wifiConnect);

void connectWiFi () {
    // Kết nối vào mạng Wi-Fi đã cấu hình
    WiFi.begin(ssid, pass);
    delay(10);
    Serial.println("Connecting to Wifi");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.print("\nConnected to WiFi\n");
}

void saveState(int ledState, int fanState, int musicState) {
    // Ghi lại trạng thái thiết bị để khôi phục sau khi khởi động lại
    EEPROM.write(0, ledState);
    EEPROM.write(1, fanState);
    EEPROM.write(2, musicState);
    EEPROM.commit();
}

void loadState() {
    // Đọc trạng thái thiết bị đã lưu trong EEPROM
  int ledState = EEPROM.read(0);
  int fanState = EEPROM.read(1);
  int musicState = EEPROM.read(2);

  digitalWrite(LED_, ledState);
  digitalWrite(FAN_, fanState);
  digitalWrite(MUSIC_, musicState);
}

void callback (char* topic, byte* payload, unsigned int length) {
    // Gom dữ liệu tải MQTT thành chuỗi để xử lý
    String msg = "";
    for (int i = 0; i < length; i++) msg += (char) payload[i];

    Serial.printf("Message from %s: %s\n", topic, msg);

    StaticJsonDocument<128> doc;
    // Phân tích JSON nhận từ broker để lấy lệnh điều khiển
    DeserializationError err = deserializeJson(doc, msg);
    if (err) {
        Serial.printf("Error deserializeJson: %s\n", err.c_str());
        return;
    } 
    
    const char* id = doc["id"];
    const char* led = doc["led"] | "";
    const char* fan = doc["fan"] | "";
    const char* music = doc["music"] | "";

    // Cập nhật trạng thái thiết bị theo lệnh nhận được
    if (!strcmp(led, "1")) digitalWrite(LED_, HIGH);
    if (!strcmp(led, "0")) digitalWrite(LED_, LOW);
    if (!strcmp(fan, "1")) digitalWrite(FAN_, HIGH);
    if (!strcmp(fan, "0")) digitalWrite(FAN_, LOW);
    if (!strcmp(music, "1")) digitalWrite(MUSIC_, HIGH);
    if (!strcmp(music, "0")) digitalWrite(MUSIC_, LOW);
    
    StaticJsonDocument<128> res;

    // Tạo phản hồi gửi lại broker để xác nhận trạng thái hiện tại
    res["id"] = id;
    res["led"] = digitalRead(LED_) == HIGH ? "1" : "0";
    res["fan"] = digitalRead(FAN_) == HIGH ? "1" : "0";
    res["music"] = digitalRead(MUSIC_) == HIGH ? "1" : "0";
    
    char buffer[128];
    int n = serializeJson(res, buffer);

    client.publish("responseDevice", buffer, n);

    saveState(digitalRead(LED_), digitalRead(FAN_), digitalRead(MUSIC_));
}

void setup () {
    // Khởi tạo Serial, bộ nhớ, chân điều khiển và cảm biến
    Serial.begin(115200);
    EEPROM.begin(512);
    connectWiFi();

    pinMode(LED_BUILTIN, OUTPUT);
    pinMode(LED_, OUTPUT);
    pinMode(FAN_, OUTPUT);
    pinMode(MUSIC_, OUTPUT);
    loadState();

    dht.begin();
    Wire.begin(SDA, SCL);
    bh1750.begin();

    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
}

void reconnectMQTT (){
    // Thử kết nối lại MQTT cho tới khi thành công
    while (!client.connected()){
        Serial.println("Trying MQTT connection...");
        if (client.connect("ESP8266", mqtt_user, mqtt_pass)) {
            Serial.println("Connected!");
            client.subscribe("controlDevice");
        } else {
            Serial.println("Fail to connect MQTT, try again in 5 second");
            delay(5000);
        }
    }
}

void pubDataSensor () {
    // Đọc dữ liệu cảm biến ánh sáng và nhiệt độ/độ ẩm
    int light = bh1750.readLightLevel();
    float temp = dht.readTemperature();
    float humi = dht.readHumidity();
    if(isnan(temp) || isnan(humi)) return;

    StaticJsonDocument<128> doc;
    // Đóng gói dữ liệu thành JSON và gửi lên MQTT
    doc["temp"] = temp;
    doc["humi"] = humi;
    doc["light"] = light;

    char buffer[128];
    int n = serializeJson(doc, buffer);
    client.publish("dataSensor", buffer, n);
}

unsigned long lastPub = 0;
const long interval = 2000;

void loop () {
    // LED báo trạng thái Wi-Fi; nếu mất kết nối thì thử kết nối lại
    if (WiFi.status() == WL_CONNECTED) digitalWrite(LED_BUILTIN, LOW);
    else {
        digitalWrite(LED_BUILTIN, HIGH);
        connectWiFi();
    }
    
    // Duy trì kết nối MQTT và xử lý các thông điệp
    if (!client.connected()) reconnectMQTT();
    client.loop();

    unsigned long now = millis();
    // Gửi dữ liệu cảm biến sau mỗi khoảng thời gian xác định
    if (now - lastPub >= interval) {
        lastPub = now;
        pubDataSensor();
    }
    
}

