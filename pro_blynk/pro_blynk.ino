#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <Servo.h>


// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
char auth[] = "mNjgEPGW5OtJB0SAuUgZLgsG9LI8Cbyk";
BlynkTimer timer; // Create a Timer object called "timer"!
Servo myservo;  // create servo object to control a servo

// Your WiFi credentials.
// Set password to "" for open networks.
char ssid[] = "Silver Lions Zone";
char pass[] = "science@123";
String pos,ldr,dist;
const int red= D5;
const int green= D6;
const int trigPin = D3;
const int echoPin = D4;
const int buttonPin = D7;

BLYNK_READ(V3) // Widget in the app READs Virtal Pin V4 with the certain frequency
{
   int ldrValue = analogRead(A0);   // read the ldr input on analog pin 0
   if(ldrValue<100){
          Blynk.notify("It's too dark here!");
    }
   ldr = String(ldrValue);
   Serial.println("LDR: "+ldr);
   Blynk.virtualWrite(V3, ldrValue);
}


// This function will be called every time Slider Widget
// in Blynk app writes values to the Virtual Pin 1
BLYNK_WRITE(V2)
{
  int pinValue = param.asInt(); // assigning incoming value from pin V1 to a variable
  pos= String(pinValue);
  myservo.write(pinValue);              // tell servo to go to position in variable 'pinValue'
  Serial.println("SERVO Slider value is: "+ pinValue);
}

// This function will be called every time Button Widget
// in Blynk app writes values to the Virtual Pin 2
BLYNK_WRITE(V1)
{
  int pinValue = param.asInt(); // assigning incoming value from pin V2 to a variable
  if(pinValue==1)
      digitalWrite(red,HIGH);
    else
      digitalWrite(red,LOW);
  Serial.println("RED BUTTON value is: "+ pinValue);
}

// This function will be called every time Button Widget
// in Blynk app writes values to the Virtual Pin 3
BLYNK_WRITE(V0)
{
  int pinValue = param.asInt(); // assigning incoming value from pin V3 to a variable
  if(pinValue==1)
      digitalWrite(green,HIGH);
    else
      digitalWrite(green,LOW);  
   Serial.println("GREEN BUTTON value is: "+ pinValue);
}

void setup()
{
  // Debug console
  Serial.begin(115200);
  pinMode(A0, INPUT); 
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(trigPin, OUTPUT);  // Sets the trigPin as an Output
  pinMode(echoPin, INPUT);  // Sets the echoPin as an Input

  myservo.attach(D8);  // attaches the servo on D8 to the servo object

  //Blynk.begin(auth, ssid, pass);
  // You can also specify server:
  //Blynk.begin(auth, ssid, pass, "blynk-cloud.com", 80);
   Blynk.begin(auth, ssid, pass,"192.168.1.42", 8080);
    timer.setInterval(5000L,updateChart);
}

void loop()
{
  Blynk.run();
  timer.run();
}

void updateChart(){
   int d = triggerRadar(trigPin,echoPin);   // read the distance from ultrasonic sensor
   if(d<10){
      Blynk.notify("You're too close!");
    }
   dist = String(d);
   Serial.println("Dist: "+dist);
   Blynk.virtualWrite(V4, d);
}

int triggerRadar(int trigPin, int echoPin){
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  int d = duration*0.0343/2;
  return d;
}
