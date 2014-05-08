#include <Adafruit_NeoPixel.h>


// NeoPixel init
#define PIN 6

// Parameter 1 = number aof pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(60, PIN, NEO_GRB + NEO_KHZ800);

// Pixel array
  int pixRGB[12][3];
  int emoArray[4] = {10,30,50,35};
  int interval[4] = {3, 2, 5, 1};
  boolean climbing[4] = {true,false,true,true};
// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.

// ================================================================
// ARDUINO APPLICATION SETUP AND LOOP FUNCTIONS
// ================================================================

// initialization sequence
void setup() {

    //NeoPixel config
    strip.begin();
    strip.setPixelColor(0,0,50,0); //Aliveness pixel
    strip.show(); // Initialize all pixels 
   
}

// main application loop
void loop() {

    
/*    Serial.println("Sample data (received):");
    Serial.println(emoArray[0]);
    Serial.println(emoArray[1]);
    Serial.println(emoArray[2]);
    Serial.println(emoArray[3]);
*/  
    
    for(int i = 0; i < 4; i++){
      if(climbing[i] and random(4) <= 1){
        emoArray[i] = (emoArray[i]+interval[i]);
      }else if(random(4) <= 1){
        emoArray[i] = (emoArray[i]-interval[i]);
      }
      
      if(emoArray[i] > 75){
        climbing[i] = false;
      }else if(emoArray[i]<6){
        climbing[i] = true;
      }
    }
          
    // LED Output
    float minBright = 5;
    float maxBright = 255.0;
    float brightScalar = (maxBright-minBright)/255.0;
    
    
    // setPixelColor(pixel, R,G,B)
    // red = frustration
    for(int pixel = 0; pixel < 3; pixel++)
    {
      strip.setPixelColor(pixel, emoArray[0]*brightScalar + minBright, 0, 0);
    }
    
    // green = engagement
    for(int pixel = 0; pixel < 3; pixel++)
    {
      strip.setPixelColor(pixel+3, 0, emoArray[1]*brightScalar + minBright,0);
    }
    
    // blue = meditation
    for(int pixel = 0; pixel < 3; pixel++)
    {
      strip.setPixelColor(pixel+6, 0, 0, emoArray[2]*brightScalar + minBright);
    }
    
    // yellow = excitement
    for(int pixel = 0; pixel < 3; pixel++)
    {
      strip.setPixelColor(pixel+9, emoArray[3]*brightScalar + minBright, emoArray[3]*brightScalar + minBright,0);
    }

    strip.show();
    delay(200);
}
