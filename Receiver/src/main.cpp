#include <SPI.h>
#include <RF22.h>
#include <RF22Router.h>
#include <dht11.h>
#include <Servo.h>

#define ALARM_PIN 7 // Digital pin connected to the buzzer
#define DHT11PIN 3     // Digital pin connected to the DHT sensor
#define LASERPIN 5 // Digital pin connected to the laser
#define MY_ADDRESS 66 // define my unique address
#define DESTINATION_ADDRESS_1 67 // define who I can talk to
#define DESTINATION_ADDRESS_2 68 // define who I can talk to

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
int humidity = 0; // Variable to store humidity value
int temperature = 0; // Variable to store temperature value
int movement = 0; // Variable to store movement status
int separate (String str, char   **p, int    size );
char message[100];
int isLocked = 0;
long lastmovement = 0, lastDoorApproached=0; // Variable to store the time of the last movement
int doorApproached = 0, someoneApproachedDoor=0; // Variable to store if the door has been approached
int isAlarmOn = 0; // Variable to store if the alarm is on
int enabled = 1;

void setup() {
  Serial.begin(9600);
  pinMode(LASERPIN, INPUT); // Set the laser pin as output
  myservo.attach(9);  // attaches the servo on pin 9 to the Servo object
  pinMode(ALARM_PIN, OUTPUT); // Set the buzzer pin as output

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


  delay(1000); // Wait for 2 seconds before the next reading
  if (Serial.available()){
      int incomingByte = Serial.read(); // Read the incoming byte from the serial monitor
      if (incomingByte == '2') { // If the incoming byte is '1'
        enabled=1;
      } else if (incomingByte == '3') { // If the incoming byte is '0'
        enabled=0;
        myservo.write(0); // Open the door
        isLocked = 0; // Set the isLocked flag to false
        digitalWrite(ALARM_PIN, LOW); // Turn off the buzzer
        isAlarmOn = 0; // Set the isAlarmOn flag to false
      }
      if (enabled){
        if (incomingByte == '1') { // If the incoming byte is '1'
          myservo.write(0); // Open the door
          isLocked = 0; // Set the isLocked flag to false
          digitalWrite(ALARM_PIN, LOW); // Turn off the buzzer
          isAlarmOn = 0; // Set the isAlarmOn flag to false
          // Serial.println("Door opened");
        } else if (incomingByte == '0') { // If the incoming byte is '0'
          myservo.write(150); // Lock the door
          isLocked = 1; // Set the isLocked flag to true
          // Serial.println("Door locked");
        }
      }

  }

  // Check if the laser is triggered
  if (millis() - lastmovement > 5 && movement == 1) { 
    movement = 0; // Reset movement flag after 10 seconds of no movement
  }
  if(digitalRead(LASERPIN)==LOW){
    // Serial.println("Obstacles!");   
    movement = 1; // Set movement flag to true
    lastmovement = millis(); // Record the time of the last movement             
  }

  if (frontDoorDistance<100 && doorApproached == 0) { // If the distance is less than 100 cm and the door has not been approached yet
    doorApproached = 1; // Set the doorApproached flag to true
    lastDoorApproached=millis();
  }
  else if (frontDoorDistance >= 100 && doorApproached == 1) { // If the distance is greater than or equal to 100 cm and the door has been approached
    doorApproached = 0; // Reset the doorApproached flag
    someoneApproachedDoor = 0; // Reset the someoneApproachedDoor flag
  }
  if (doorApproached == 1 && millis() - lastDoorApproached > 10000) { // If the door has been approached for more than 10 seconds
    someoneApproachedDoor = 1; // Set the someoneApproachedDoor flag to true
  }
  if(enabled){
    if(isBuzzerOn || movement || someoneApproachedDoor) { // If the buzzer is on, or there is movement, or someone has approached the door
      myservo.write(150);
      isLocked = 1;
    }
    if (isBuzzerOn || movement){
      digitalWrite(ALARM_PIN, HIGH); // Turn on the buzzer
      isAlarmOn = 1; // Set the isAlarmOn flag to true
    }
    if (isCorrectCode){
      myservo.write(0);
      isLocked = 0;
      digitalWrite(ALARM_PIN, LOW); // Turn off the buzzer
      isAlarmOn = 0; // Set the isAlarmOn flag to false
    }
  }else {
    isCorrectCode=0;
    isAlarmOn=0;
  }

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
      // for (int n = 0; n < N; n++)
      //     Serial.println (sPtr [n]);
    }
    if (from == DESTINATION_ADDRESS_2) {
      int N = separate (incoming, sPtr, SPTR_SIZE);
      humidity = atoi (sPtr [0]);
      temperature = atoi (sPtr [1]);

    }


  }
  
  sprintf (message, "$%d,%d,%d,%d,%d,%d,%d,%d,%d,!", frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movement,isLocked,enabled);
  Serial.println(message);


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