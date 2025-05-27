#include <SPI.h>
#include <RF22.h>
#include <RF22Router.h>
#include <dht11.h>
#include <Servo.h>


#define DHT11PIN 3     // Digital pin connected to the DHT sensor
#define LASERPIN 5 // Digital pin connected to the laser
#define MY_ADDRESS 66 // define my unique address
#define DESTINATION_ADDRESS_1 67 // define who I can talk to
//#define DESTINATION_ADDRESS_2 3 // define who I can talk to
#define SPTR_SIZE   20
char   *sPtr [SPTR_SIZE];
// Singleton instance of the radio
RF22Router rf22(MY_ADDRESS); // initiate the class to talk to my radio with MY_ADDRESS
char received_value;
uint8_t rssi;
float Pr=-90;
dht11 DHT11;
Servo myservo;  // create Servo object to control a servo
int frontDoorDistance = 0; // Variable to store the distance from the front door
int isCorrectCode = 0; // Variable to store if the code is correct
int isBuzzerOn = 0; // Variable to store if the buzzer is on
int attemptsLeft = 0; // Variable to store the number of attempts left
int separate (String str, char   **p, int    size );

void setup() {
  Serial.begin(9600);
  pinMode(LASERPIN, INPUT); // Set the laser pin as output
  myservo.attach(9);  // attaches the servo on pin 9 to the Servo object

  if (!rf22.init())
    Serial.println("RF22 init failed");
  // Defaults after init are 434.0MHz, 0.05MHz AFC pull-in, modulation FSK_Rb2_4Fd36
  if (!rf22.setFrequency(434.0)) // The frequency should be the same as that of the transmitter. Otherwise no communication will take place
    Serial.println("setFrequency Fail");
  rf22.setTxPower(RF22_TXPOW_20DBM);
  //1,2,5,8,11,14,17,20 DBM
  rf22.setModemConfig(RF22::GFSK_Rb125Fd125  );// The modulation should be the same as that of the transmitter. Otherwise no communication will take place
  //modulation

  // Manually define the routes for this network
  rf22.addRouteTo(DESTINATION_ADDRESS_1, DESTINATION_ADDRESS_1); // tells my radio card that if I want to send data to DESTINATION_ADDRESS_1 then I will send them directly to DESTINATION_ADDRESS_1 and not to another radio who would act as a relay 
  delay(100);
}

void loop() 
{

  // Read data from DHT11 sensor
  int chk = DHT11.read(DHT11PIN);
  // Serial.print("Humidity (%): ");
  // Serial.println((float)DHT11.humidity, 2);

  // Serial.print("Temperature  (C): ");
  // Serial.println((float)DHT11.temperature, 2);
  delay(1000); // Wait for 2 seconds before the next reading

  // Check if the laser is triggered
  // if(digitalRead(LASERPIN)==LOW){
  //   Serial.println("Obstacles!");
  //   myservo.write(180);                  
  // }
  // else{
  //   Serial.println("NO Obstacles!");
  //   myservo.write(0);                  
  // }


  // Should be a message for us now  
  uint8_t buf[RF22_ROUTER_MAX_MESSAGE_LEN];
  char incoming[RF22_ROUTER_MAX_MESSAGE_LEN];
  memset(buf, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
  memset(incoming, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
  uint8_t len = sizeof(buf); 
  uint8_t from;
  //digitalWrite(5, LOW);
  if (rf22.recvfromAck(buf, &len, &from)) // I'm always expecting to receive something from any legitimate transmitter (DESTINATION_ADDRESS_1, DESTINATION_ADDRESS_2). If I do, I'm sending an acknowledgement
  {
 //   digitalWrite(5, HIGH);
    // rssi = rf22.rssiRead();
    // Pr=((float)rssi-230.0)/1.8;
    // Serial.print("RSSI= ");
    // Serial.println(Pr);
    // Serial.println(" dBm");

    buf[RF22_ROUTER_MAX_MESSAGE_LEN - 1] = '\0';
    memcpy(incoming, buf, RF22_ROUTER_MAX_MESSAGE_LEN); // I'm copying what I have received in variable incoming
    //Serial.println(incoming); // and showing them on the screen
    // received_value=strtok(incoming, ","); // transforming my data into an integer
    // Serial.print(incoming); // and showing them on the screen
    // Serial.print(" ");
    // received_value=strtok(incoming, ","); // transforming my data into an integer
    // Serial.println(incoming); // and showing them on the screen
    if (from == DESTINATION_ADDRESS_1) {
      int N = separate (incoming, sPtr, SPTR_SIZE);
      frontDoorDistance = atoi (sPtr [0]);
      isCorrectCode = atoi (sPtr [1]);
      isBuzzerOn = atoi (sPtr [2]);
      attemptsLeft = atoi (sPtr [3]);
      for (int n = 0; n < N; n++)
          Serial.println (sPtr [n]);
    }


  }
}


int
separate (
    String str,
    char   **p,
    int    size )
{
    int  n;
    char s [100];

    strcpy (s, str.c_str ());

    *p++ = strtok (s, ",");
    for (n = 1; NULL != (*p++ = strtok (NULL, ",")); n++)
        if (size == n)
            break;

    return n;
}