#include <Adafruit_NeoPixel.h>


// NeoPixel init
#define PIN 6

// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(60, PIN, NEO_GRB + NEO_KHZ800);

// Pixel array
  int pixVals[36];

int incomingByte;

// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.

// ================================================================
// ARDUINO APPLICATION SETUP AND LOOP FUNCTIONS
// ================================================================

// initialization sequence
void setup() {

    // open Arduino USB serial
    Serial.begin(57600);

    //NeoPixel config
    strip.begin();
    strip.setPixelColor(0,0,50,0); //Aliveness pixel
    strip.show(); // Initialize all pixels 
}

// main application loop
void loop() {
  
    // Get pixel data 
    for(int b = 0; b < 36; b++)
    {
      while(Serial.available() <= 0)
      {}
      pixVals[b] = Serial.read();
    }  
    
    //
    for(int pixel = 0; pixel < 12; pixel++)
    {
      int start = pixel*3;
      strip.setPixelColor(pixel, pixVals[start], pixVals[start+1],pixVals[start+2]);
    }
        
    strip.show();
}
