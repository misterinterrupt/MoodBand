import csv
csvfile = open('fakeEmotions.csv', 'wb')
csvwriter = csv.writer(csvfile)

csvwriter.writerow()

csvfile.close()
