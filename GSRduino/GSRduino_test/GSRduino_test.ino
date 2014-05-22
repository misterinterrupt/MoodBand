int minGSR = 0; 
int maxGSR = 0;
int GSR = 0;



void setup(){
  Serial.begin(57600);
  
  pinMode(6, OUTPUT);
  digitalWrite(6, HIGH);
  delay(1000);
  digitalWrite(6, LOW);
}

void loop(){
  
  GSR = analogRead(0);
  if(GSR > maxGSR){
    maxGSR = GSR;
  }
  if(GSR < minGSR){
    minGSR = GSR;
  }
  
  Serial.print("GSR: "); 
  Serial.print(GSR);
  Serial.print("  Min: ");
  Serial.print(minGSR);
  Serial.print("  Max: ");
  Serial.println(maxGSR);
  
//  analogWrite(12, GSR/4);
//  analogWrite(6, 100);
  
  delay(1000);
}
