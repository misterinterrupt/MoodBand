package com.spaceout;

import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;

import com.emotiv.*;

public class EmotivWrapper {
    static Pointer eEvent			= Edk.INSTANCE.EE_EmoEngineEventCreate();
    static Pointer eState	        = Edk.INSTANCE.EE_EmoStateCreate();
    static IntByReference userID 	= null;
    static short composerPort	   	= 1726;
    static int debugMode       		= 0;
    static int state    	    	= 0;

    static float boredomScore = 0.0f;
    static float frustScore = 0.0f;
    static float exciteScore = 0.0f;
    static float medScore = 0.0f;

    public static void connect() {
        userID = new IntByReference(0);

    	switch (debugMode) {
		case 0:
		{
			if (Edk.INSTANCE.EE_EngineConnect("Emotiv Systems-5") != EdkErrorCode.EDK_OK.ToInt()) {
				System.out.println("Emotiv Engine start up failed.");
				return;
			}
			break;
		}
		case 1:
		{
			System.out.println("Target IP of EmoComposer: [127.0.0.1] ");

			if (Edk.INSTANCE.EE_EngineRemoteConnect("127.0.0.1", composerPort, "Emotiv Systems-5") != EdkErrorCode.EDK_OK.ToInt()) {
				System.out.println("Cannot connect to EmoComposer on [127.0.0.1]");
				return;
			}
			System.out.println("Connected to EmoComposer on [127.0.0.1]");
			break;
		}
		default:
			System.out.println("Invalid option...");
			return;
    	}
    }

    public static void disconnect() {
    	Edk.INSTANCE.EE_EngineDisconnect();
    	System.out.println("Disconnected!");
    }

    public static void pollForever() {
		while (true)
		{
			state = Edk.INSTANCE.EE_EngineGetNextEvent(eEvent);

			// New event needs to be handled
			if (state == EdkErrorCode.EDK_OK.ToInt()) {

				int eventType = Edk.INSTANCE.EE_EmoEngineEventGetType(eEvent);
				Edk.INSTANCE.EE_EmoEngineEventGetUserId(eEvent, userID);

				// Log the EmoState if it has been updated
				if (eventType == Edk.EE_Event_t.EE_EmoStateUpdated.ToInt()) {

					Edk.INSTANCE.EE_EmoEngineEventGetEmoState(eEvent, eState);
					float timestamp = EmoState.INSTANCE.ES_GetTimeFromStart(eState);
					System.out.println(timestamp + " : New EmoState from user " + userID.getValue());

					System.out.print("WirelessSignalStatus: ");
					System.out.println(EmoState.INSTANCE.ES_GetWirelessSignalStatus(eState));

					boredomScore = EmoState.INSTANCE.ES_AffectivGetEngagementBoredomScore(eState);
					frustScore = EmoState.INSTANCE.ES_AffectivGetFrustrationScore(eState);
					exciteScore = EmoState.INSTANCE.ES_AffectivGetExcitementShortTermScore(eState);

			  medScore = EmoState.INSTANCE.ES_AffectivGetMeditationScore(eState);

     System.out.println("State: " + boredomScore + ", " + frustScore + ", " + exciteScore + ": " + medScore);
     }
			}
			else if (state != EdkErrorCode.EDK_NO_EVENT.ToInt()) {
				System.out.println("Internal error in Emotiv Engine!");
				break;
			}
        }
        disconnect();
    }

    public static float getBoredScore() {
        return boredomScore;
    }
    public static float getExciteScore() {
        return exciteScore;
    }
    public static float getFrustScore() {
        return frustScore;
    }
    public static float getMedScore() {
        return medScore;
    }
}
