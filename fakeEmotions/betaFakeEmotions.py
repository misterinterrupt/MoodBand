import csv, math
import random as r

STEP_SIZE = 0.005
COS_SCALE = .01
STEPS_SEC = 20.

filename = 'fakeEmotions.csv'
duration = 60
cycles =1
numMoods = 4

ENDTIMES = int(duration*STEPS_SEC)

def constrain(a, n, x):
	return n if a <=n else (x if a >= x else a)

csvfile = open(filename, 'wb')
csvwriter = csv.writer(csvfile)

moods = [0.5 - 0.5*math.cos(i*math.pi/2) for i in range(0,numMoods)]
print moods, "BEARS\n"
for x in xrange(0, ENDTIMES):
	print x/STEPS_SEC , moods
	csvwriter.writerow(moods)
	for i in xrange(0,numMoods):
		fracThruMyTurn = 1.0 * x * cycles / ENDTIMES
		offsetForMood = (i+1.)/numMoods
		direction =  (1 if math.cos((fracThruMyTurn + offsetForMood) * math.pi / 2) >= 0.5 else -1)

		moods[i] = constrain(moods[i] + STEP_SIZE * direction + STEP_SIZE * COS_SCALE * math.cos((fracThruMyTurn  +  offsetForMood) * math.pi / 2), 0, 1.0)

csvfile.close()

