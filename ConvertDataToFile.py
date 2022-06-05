#Shawbr- Converts raw data to uncompressed richter data

#Importation
import math
import socket as s
import random
from time import sleep
#Seperator
sep='b'
newSep=','
#Setup input file
inputFile = open("RawData.txt", "r")
rawData=inputFile.read().strip()
arrayOfData=rawData.split(sep)
dataToOutput=""
bitsOfData=[""]
#For loop
i=0
while len(arrayOfData)>i:
    
    #Process data

    temp=arrayOfData[i].split(",")
    
    #Do maths
        
    #ricterScale = str(((math.log10(float(inputValue)))-4.8)/1.5)

    #For loop
    j=0
    while (len(temp))>j:
        #Finish processing
        bitsOfData.append(str(temp[j]).strip().strip('"').strip("{").strip("}").strip("'"))
        j+=1
    i+=1
#bitsOfData.pop(0)
#Another for loop
i=0
station=''
baseTime=''
while len(bitsOfData)>i:
    if bitsOfData[i]=="":
        bitsOfData.pop(i)
        i-=1
    elif ((i)%(27))!= 0 and (((i)%(27))!= 1):
        dataToOutput+=str(station)#Station str(bitsOfData[math.floor((i-j)/27)+1].strip()))
        dataToOutput+=newSep
        dataToOutput+=str(float(baseTime)*(i*0.01))#Time -(math.floor(i/27)
        dataToOutput+=newSep
        dataToOutput+=str(bitsOfData[i])#Data (i*0.01)
        dataToOutput+="~"
    elif (i)%(27)!= 1:
        station=str(bitsOfData[i])
    elif (i)%(27)!= 0:
        baseTime=str(bitsOfData[i])
    #math.floor((i/25))
    #dataToOutput+=str(bitsOfData[i]).strip()
    #dataToOutput+=","
    i+=1
outputFile = open("outputFile.txt", "w")
outputFile.write(dataToOutput)
outputFile.close()
print("Fin")

#Data getting stuff    (Disabled)

#host = 'localhost'##IP
#finalData="1"
#port = 8888                             # Port to bind to
#sock = s.socket(s.AF_INET, s.SOCK_DGRAM | s.SO_REUSEADDR)
#sock.bind((host, port))
#print ("Waiting for data on Port:"), port
#while 1:                                # loop forever
    #data, addr = sock.recvfrom(1024)    # wait to receive data
    #data=random.random()
    #print (data)
    #finalData=str(data)
    #Output to file
    #outputFile = open("outputFile.txt", "w")
    #outputFile.write(str(data))
    #outputFile.close()
    #sleep(0.2)
