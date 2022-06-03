#Import
import math
import socket as s
import random
from time import sleep
#Setup files
#inputFile = open("inputFile.txt", "r")
#outputFile = open("outputFile.txt", "w")
#Do maths
#inputValue=inputFile.read().strip()
#ricterScale = str(((math.log10(float(inputValue)))-4.8)/1.5)
#Output to file
#outputFile.write(str(ricterScale))
#outputFile.close()



host = 'localhost'##IP
finalData="1"
port = 8888                             # Port to bind to
#sock = s.socket(s.AF_INET, s.SOCK_DGRAM | s.SO_REUSEADDR)
#sock.bind((host, port))
print ("Waiting for data on Port:"), port
while 1:                                # loop forever
    #data, addr = sock.recvfrom(1024)    # wait to receive data
    data=random.random()
    print (data)
    finalData=str(data)
    #Output to file
    outputFile = open("outputFile.txt", "w")
    outputFile.write(str(data))
    outputFile.close()
    sleep(0.2)
