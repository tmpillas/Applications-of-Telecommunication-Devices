#include <SPI.h>
#include <RF22.h>
#include <RF22Router.h>
#include <dht11.h>
#define DHT11PIN 4    // Digital pin connected to the DHT sensor



#define MY_ADDRESS 68 // define my unique address
#define DESTINATION_ADDRESS_1 66 // define who I can talk to
//#define DESTINATION_ADDRESS_2 3 // define who I can talk to


RF22Router rf22(MY_ADDRESS); // initiate the class to talk to my radio with MY_ADDRESS
int number_of_bytes=0; // will be needed to measure bytes of message
float throughput=0; // will be needed for measuring throughput

int attemptsLeft = 0; // Variable to store the number of attempts left
int humidity = 0; // Variable to store humidity value
int temperature = 0; // Variable to store temperature value
int initial_time = 0;
int final_time = 0;
long lastMillis = 0;
int interval = 5000;
int send = 0;
dht11 DHT11;
uint8_t rssi;
float Pr=-90;


void setup() {
Serial.begin(9600); // to be able to view the results in the computer's monitor
  if (!rf22.init()) // initialize my radio
    Serial.println("RF22 init failed");
  // Defaults after init are 434.0MHz, 0.05MHz AFC pull-in, modulation FSK_Rb2_4Fd36
  if (!rf22.setFrequency(434.0)) // set the desired frequency
    Serial.println("setFrequency Fail");
  rf22.setTxPower(RF22_TXPOW_20DBM); // set the desired power for my transmitter in dBm
  //1,2,5,8,11,14,17,20 DBM
  rf22.setModemConfig(RF22::GFSK_Rb125Fd125  ); // set the desired modulation
  //modulation

  // Manually define the routes for this network
  rf22.addRouteTo(DESTINATION_ADDRESS_1, DESTINATION_ADDRESS_1); // tells my radio card that if I want to send data to DESTINATION_ADDRESS_1 then I will send them directly to DESTINATION_ADDRESS_1 and not to another radio who would act as a relay

  delay(1000); 
}

void loop() 
{ 

  if (millis() - lastMillis > interval){
    lastMillis = millis();

    send = true;
      // Read data from DHT11 sensor
    int chk = DHT11.read(DHT11PIN);

    humidity = DHT11.humidity; // Store humidity value
    temperature = DHT11.temperature; // Store temperature value
    // Serial.print("Humidity: ");
    // Serial.print(humidity);
    // Serial.print("%, Temperature: ");
    // Serial.print(temperature);
  }

  
  if(send){
  // the following variables are used in order to transform my integer measured value into a uint8_t variable, which is proper for my radio
    char data_read[RF22_ROUTER_MAX_MESSAGE_LEN];
    uint8_t data_send[RF22_ROUTER_MAX_MESSAGE_LEN];
    memset(data_read, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
    memset(data_send, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);    
    sprintf(data_read, "%d,%d", humidity,temperature); // I'm copying the measurement sensorVal into variable data_read
    data_read[RF22_ROUTER_MAX_MESSAGE_LEN - 1] = '\0'; 
    memcpy(data_send, data_read, RF22_ROUTER_MAX_MESSAGE_LEN); // now I'm copying data_read to data_send
    number_of_bytes=sizeof(data_send); // I'm counting the number of bytes of my message
    

    // just demonstrating that the string I will send, after those transformation from integer to char and back remains the same
  
    Serial.println(data_read);
    if (rf22.sendtoWait(data_send, sizeof(data_send), DESTINATION_ADDRESS_1) != RF22_ROUTER_ERROR_NONE) // I'm sending the data in variable data_send to DESTINATION_ADDRESS_1... cross fingers
    {
      //LOGIC IF FAIL TODO SOMETHING
    }
    else
    {
      send = false;

    }
    
  }
}

