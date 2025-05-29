#include <Keypad.h>
#include <SPI.h>
#include <RF22.h>
#include <RF22Router.h>

// BLUE TRANSCEIVER
// PIN OF BUZZER : A0
// PIN OF PROXIMITY : A1
// PINS OF KEYPAD : ROWS (LEFT TO RIGHT)     9 A2 7 6
//                  COLLUMNS (LEFT TO RIGHT) 5 3 4 A3

#define pingPin  A1
#define MY_ADDRESS 67 // define my unique address
#define DESTINATION_ADDRESS_1 66 // define who I can talk to
//#define DESTINATION_ADDRESS_2 3 // define who I can talk to


long microsecondsToCentimeters(long microseconds);
RF22Router rf22(MY_ADDRESS); // initiate the class to talk to my radio with MY_ADDRESS
int number_of_bytes=0; // will be needed to measure bytes of message
float throughput=0; // will be needed for measuring throughput
int flag_measurement=0;

int initial_time = 0;
int final_time = 0;
long prox_print = 0, lastCorrectCode = 0;
int codeInterval= 10000; // time interval to check for proximity sensor and correct code entry
bool lastCorrectCodeFlag = false; // flag to indicate if the last code entry was correct
int interval = 5000;

uint8_t rssi;
float Pr=-90;


const byte ROWS = 4; // four rows
const byte COLS = 4; // four columns
char hexaKeys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {9, A2, 7, 6};
byte colPins[COLS] = {5, 4, 3, A3};

Keypad customKeypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

String inputCode = "";
const String password = "1220";
bool buzzerflag = false,send;
int attempts = 3;
long duration, cm;
bool correct_code = false;


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
  Serial.println("Welcome THOMA ACHILEA BILLA");
  Serial.println("To open the door, insert the correct password");


  //BUZZER
  pinMode(A0, OUTPUT); 
  digitalWrite(A0, LOW);

  delay(1000); 
}

void loop() 
{ 

  
 
  if(millis()-prox_print > interval){
    prox_print = millis();
  pinMode(pingPin, OUTPUT);
  digitalWrite(pingPin, LOW);
  delayMicroseconds(2);
  digitalWrite(pingPin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingPin, LOW);

  pinMode(pingPin, INPUT);
  duration = pulseIn(pingPin, HIGH);
  cm = microsecondsToCentimeters(duration);
    
    send = true;
  }

	char customKey = customKeypad.getKey();

  if (customKey &&  !buzzerflag && lastCorrectCodeFlag==false ) { // Check if a key is pressed and buzzer is not active
    Serial.println(customKey);
    prox_print = millis(); // reset the timer for proximity sensor
    send = false; // reset send flag
    // Only accept digits, discard other keys like A-D, *, #
    if (isDigit(customKey)) {
      inputCode += customKey;

      // Once 4 digits entered, check the code
      if (inputCode.length() == 4 ) {
        if (inputCode == password) {\
          lastCorrectCode = millis(); // record the time of the last correct code entry
          lastCorrectCodeFlag = true; // set flag to indicate correct code was entered
          Serial.println("Password is correct, opening door");
          correct_code = true;
          send = true;
        } else {
			if (attempts == 1)
			{
				Serial.println("Maximum attempts reached, initiating buzzer protocol");		
				buzzerflag = true;
			}
			else
			{		
				attempts = attempts - 1  ;
				Serial.print("Incorrect Password, attempts remaining " );
				Serial.println(attempts);
			}
        }
        inputCode = ""; // reset for next attempt
      }
    }
  }
  if (lastCorrectCodeFlag && (millis() - lastCorrectCode > codeInterval)) {
    attempts = 3; // reset attempts after code interval
    lastCorrectCodeFlag = false; // reset flag
    correct_code = false; // reset correct code flag
  }
   
  initial_time=millis();
  
  int sensorVal = cm; // PROXIMITY VALUE
  if(send){
  // the following variables are used in order to transform my integer measured value into a uint8_t variable, which is proper for my radio
    char data_read[RF22_ROUTER_MAX_MESSAGE_LEN];
    uint8_t data_send[RF22_ROUTER_MAX_MESSAGE_LEN];
    memset(data_read, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);
    memset(data_send, '\0', RF22_ROUTER_MAX_MESSAGE_LEN);    
    sprintf(data_read, "%d,%d,%d,%d", sensorVal,correct_code,buzzerflag,attempts); // I'm copying the measurement sensorVal into variable data_read
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


long microsecondsToCentimeters(long microseconds) {
  // The speed of sound is 340 m/s or 29 microseconds per centimeter.
  // The ping travels out and back, so to find the distance of the object we
  // take half of the distance travelled.
  return microseconds / 29 / 2;
}