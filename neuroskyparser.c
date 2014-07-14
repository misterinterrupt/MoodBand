#include <stdio.h>
#include "./ThinkGearStreamParser.c"
/**
* 1) Function which acts on the value[] bytes of each ThinkGear DataRow as it is received.
*/
int i = 0;
void handleDataValueFunc(  unsigned char extendedCodeLevel,
											unsigned char code,
											unsigned char valueLength,
											const unsigned char *value,
											void *customData ) {

	if( extendedCodeLevel == 0 ) {
		switch( code ) {
			/* [CODE]: ATTENTION eSense */
			case( 0x04 ):
			printf( "Attention Level: %d\n", value[0] & 0xFF );
			break;
			/* [CODE]: MEDITATION eSense */
			case( 0x05 ):
			printf( "Meditation Level: %d\n", value[0] & 0xFF );
			break;
			/* Other [CODE]s */
			// default:
			// printf( "EXCODE level: %d CODE: 0x%02X vLength: %d\n",
			// extendedCodeLevel, code, valueLength );
			// printf( "Data value(s):" );
			// for( i=0; i<valueLength; i++ ) {
			// 	printf( " %02X", value[i] & 0xFF );
			// }
			//printf( "\n" );
		}
	}
}

/**
* Program which reads ThinkGear Data Values from a COM port.
*/
int main( int argc, char **argv ) {
	/* 2) Initialize ThinkGear stream parser */
	ThinkGearStreamParser parser;
	THINKGEAR_initParser( &parser, PARSER_TYPE_PACKETS,
	handleDataValueFunc, NULL );

	/* TODO: Initialize 'stream' here to read from a serial data
	* stream, or whatever stream source is appropriate for your
	* application. See documentation for "Serial I/O" for your
	* platform for details.
	*/
	FILE *stream = fopen( "/dev/tty.MindWaveMobile-DevA", "rb+" );
	/* 3) Stuff each byte from the stream into the parser. Every time
	* a Data Value is received, handleDataValueFunc() is called.
	*/
	unsigned char streamByte;
	while( 1 ) {
		fread( &streamByte, 1, 1, stream );
		THINKGEAR_parseByte( &parser, streamByte );
	}
}