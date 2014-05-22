/*  RCTiming_resistance_meter
 *   Paul Badger 2008, edited by Albert Alexander 2014
 *  Demonstrates use of RC time constants to measure skin resistance 
 *
 * Theory   A capcitor will charge, through a resistor, in one time constant, defined as T seconds where
 *    TC = R * C
 * 
 *    TC = time constant period in seconds
 *    R = resistance in ohms
 *    C = capacitance in farads (1 microfarad (ufd) = .0000001 farad = 10^-6 farads ) 
 *
 *    The capacitor's voltage at one time constant is defined as 63.2% of the charging voltage.
 *
 *  Hardware setup:
 *  Known Capacitor between common point and ground (positive side of an electrolytic capacitor  to common)
 *  Skin electrodes between chargePin and common point
 *  220 ohm resistor between dischargePin and common point
 *  Wire between common point and analogPin (A/D input)
 */

#define analogPin      0          // analog pin for measuring capacitor voltage
#define chargePin      2         // pin to charge the capacitor - connected to 10k/1k voltage divider
#define dischargePin   4         // pin to discharge the capacitor
#define capacitorValue  0.0000001F   // change this to whatever resistor value you are using
                                  // F formatter tells compliler it's a floating point value
unsigned long maxResistance =0;
unsigned long startTime;
unsigned long elapsedTime;
float GSR;
float resistance;                // floating point variable to preserve precision, make calculations

void setup(){
  pinMode(chargePin, OUTPUT);     // set chargePin to output
  digitalWrite(chargePin, LOW);  

  Serial.begin(9600);             // initialize serial transmission for debugging
}

void loop(){
  digitalWrite(chargePin, HIGH);  // set chargePin HIGH and capacitor charging
  startTime = millis();

  while(analogRead(analogPin)< 58){       // 587 is 63.2% of 92, which corresponds to 0.45V 
  }

  elapsedTime= millis() - startTime;
 // convert milliseconds to seconds ( 10^-3 )   
  resistance = (float)elapsedTime / (1000*capacitorValue);   
/*  Serial.print(elapsedTime);       // print the value to serial port
  Serial.print(" mS    ");         // print units and carriage return


  Serial.print(resistance/1000);       // print the value to serial port
  Serial.println(" kohms");         // print units and carriage return
*/
  
  // Calc GSR in uS
  GSR = 1000000.0/resistance;
  Serial.println(GSR);
  
/* Chart Resistance
  // Autoscale Graph
  if(maxResistance < resistance){
    maxResistance = resistance;
  }
  if(maxResistance > 1000000){
    maxResistance = 1000000;
  }  
  
  Serial.println(1023*resistance/maxResistance);
*/

  /* discharge the capacitor  */
  digitalWrite(chargePin, LOW);             // set charge pin to  LOW 
  pinMode(dischargePin, OUTPUT);            // set discharge pin to output 
  digitalWrite(dischargePin, LOW);          // set discharge pin LOW 
  while(analogRead(analogPin) > 0){         // wait until capacitor is completely discharged
  }

  pinMode(dischargePin, INPUT);            // set discharge pin back to input
} 
