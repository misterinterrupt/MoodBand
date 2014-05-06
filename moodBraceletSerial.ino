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
  int pixRGB[12][3];

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
    strip.setPixelColor(0,0,0,200); //Aliveness pixel
    strip.show(); // Initialize all pixels 
}

// main application loop
void loop() {
  
    // Get pixel data (no longer used)  
  //  for(int pixel = 0; pixel < 12; pixel++)
   // {
   /*   for(int color = 0; color < 3; color++)
      {
        while(Serial.available() <= 0)
        {}
        byte incomingByte1 = Serial.read();
        byte incomingByte2 = Serial.read();
        //Serial.print(incomingByte1, DEC);
        //Serial.println(incomingByte2, DEC);
        int nowItsAnInt = incomingByte1*16+incomingByte2;
        //Serial.println
        // if(incomingByte 
        pixRGB[pixel][color] = nowItsAnInt;
      }*/
  //  }
    int emoArray[4] = {0,0,0,0};
    
    // Generate sample serial data
//    Serial.println("Sample data (written):");
//    Serial.write(255);
//    Serial.write(200);
//    Serial.write(100);
//    Serial.write(50);
    
    for(int emo = 0; emo < 4; emo++)
    {
      while(Serial.available() <= 0)
       {}
       emoArray[emo] = Serial.read();
    }
    
/*    Serial.println("Sample data (received):");
    Serial.println(emoArray[0]);
    Serial.println(emoArray[1]);
    Serial.println(emoArray[2]);
    Serial.println(emoArray[3]);
*/    
    
    // LED Output
    float minBright = 5;
    float maxBright = 255.0;
    float brightScalar = (maxBright-minBright)/255.0;
    
    // Note: neopixels are GRB, not RGB!
    for(int pixel = 0; pixel < 3; pixel++)
    {
      strip.setPixelColor(pixel, emoArray[0]*brightScalar + minBright, 0, 0);
    }
    for(int pixel = 0; pixel < 4; pixel++)
    {
      strip.setPixelColor(pixel+3, 0, emoArray[1]*brightScalar + minBright,0);
    }
    for(int pixel = 0; pixel < 4; pixel++)
    {
      strip.setPixelColor(pixel+6, 0, 0, emoArray[2]*brightScalar + minBright);
    }
    for(int pixel = 0; pixel < 4; pixel++)
    {
      strip.setPixelColor(pixel+9, emoArray[3]*brightScalar + minBright, emoArray[3]*brightScalar + minBright,0);
    }

    

    //Serial.println("Alive");
    
    // LED test
    //  strip.setPixelColor(1, 30,30,255);
    strip.show();
}

