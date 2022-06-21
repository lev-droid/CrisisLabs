#Shawbr- Converts raw data to uncompressed richter data

#Importation
import math
import socket as s
#Seperator
sep='b'
newSep=','
#Setup input file
inputFile = open("RawData.txt", "r")
rawData=inputFile.read().strip()
arrayOfData=rawData.split(sep)
dataToOutput=""
bitsOfData=[""]
#Counts to m/s
countsMSa=384500#This is conversion for other channels
countsMSb=399650000#This is conversion for the EHZ channel
dp=10000000000000000000000000000000000000 #This is the number of dps

#For loop to convert raw data to array
i=0
while len(arrayOfData)>i:
   
    #Process data

    temp=arrayOfData[i].split(",")
   
    #For loop to clean data
    j=0
    while (len(temp))>j:
        #Finish processing
        bitsOfData.append(str(temp[j]).strip().strip('"').strip("{").strip("}").strip("'"))
        j+=1
    i+=1
    temp=''
#Clear unused data
arrayOfData=''
rawData=''

#Defult spagettit for for loop
EHZBaseData=0
ENZBaseData=0
ENNBaseData=0
ENEBaseData=0
station=''
baseTime=''
printer=0
dataTotal=0
dataCount=0
testsDone=0
#Detrend stuff
detrendNumber=10
detrendCountEHZ=0
detrendCountENZ=0
detrendCountENE=0
detrendCountENN=0
valuesTestedEHZ=[0]*detrendNumber
valuesTestedENZ=[0]*detrendNumber
valuesTestedENE=[0]*detrendNumber
valuesTestedENN=[0]*detrendNumber
#Another for loop
i=0
while len(bitsOfData)>i:
    if bitsOfData[i]=="":#Deletes empty data
        bitsOfData.pop(i)
        i-=1
    elif ((i)%(27))!= 0 and (((i)%(27))!= 1):#Test to see if it should be settingup or using data
        try:#Tests to make sure data is correct
            tester=float(bitsOfData[i])
            dataTotal+=float(bitsOfData[i])
            dataCount+=1
        except:#If data has only 24 points or less
            bitsOfData.insert((i-1),"")
            i-=1
            print(str(bitsOfData[i])+' Error')
        if i%27==26:# If it is the last peice in the line of data
            if 'EHZ'==station:#H
                if testsDone<4 and EHZBaseData==0:# test to see if this is the first time with this data
                    EHZBaseData=float(dataTotal/dataCount)#Offsets data
                    testsDone+=1#Fail safe
                currentAverage=(math.floor(((float(dataTotal/dataCount)-EHZBaseData)/countsMSb)*(10*dp)))/(10*dp)#Data
                #Detrends data
                detrendCountEHZ+=1
                if detrendCountEHZ==detrendNumber:
                    detrendCountEHZ=0
                    #J for loop
                    j=0
                    largest=0
                    smallest=dp
                    while len(valuesTestedEHZ)>j:
                        if abs(float(valuesTestedEHZ[j])) > (largest):#Takes the largest peice of data out of the last 10 bits of data
                            largest=abs(float(valuesTestedEHZ[j]))
                        if abs(float(valuesTestedEHZ[j])) < ((smallest)):#Takes the smallest peice of data out of the last 10 bits of data
                            smallest=abs(float(valuesTestedEHZ[j]))
                        j+=1
                    valueOutside=False#Tests to see if the smallest+5% is larger than the largest
                    while len(valuesTestedEHZ)>j:
                        if largest*1000<smallest*1050:
                            valueOutside=True
                        j+=1
                    if not valueOutside:
                        EHZBaseData=float(dataTotal/dataCount)#If non of the peices of data is outside that range, then detrend the data
                else:
                    valuesTestedEHZ[detrendCountEHZ]=currentAverage#Else, add this peice to detrend data
            #Comments are at the EHZ
            elif 'ENE'==station:#E
                if ((testsDone<4)) and ENEBaseData==0:
                    ENEBaseData=float(dataTotal/dataCount)
                    testsDone+=1
                currentAverage=(math.floor(((float(dataTotal/dataCount)-ENEBaseData)/countsMSa)*(10*dp)))/(10*dp)#Data
                detrendCountENE+=1
                if detrendCountENE==detrendNumber:
                    detrendCountENE=0
                    #J for loop
                    j=0
                    largest=0
                    smallest=dp
                    while len(valuesTestedENE)>j:
                        if abs(float(valuesTestedENE[j])) > abs(largest):
                            largest=float(valuesTestedENE[j])
                        if abs(float(valuesTestedENE[j])) < abs(smallest):
                            smallest=float(valuesTestedENE[j])
                        j+=1
                    valueOutside=False
                    while len(valuesTestedENE)>j:
                        if largest*1000<smallest*1050:
                            valueOutside=True
                        j+=1
                    if not valueOutside:
                        ENEBaseData=float(dataTotal/dataCount)
                else:
                    valuesTestedENE[detrendCountENE]=currentAverage
            #Comments are at the EHZ
            elif 'ENZ'==station:#Z
                if ((testsDone<4)) and ENZBaseData==0:
                    ENZBaseData=float(dataTotal/dataCount)
                    testsDone+=1
                currentAverage=(math.floor(((float(dataTotal/dataCount)-ENZBaseData)/countsMSa)*(10*dp)))/(10*dp)#Data
                detrendCountENZ+=1
                if detrendCountENZ==detrendNumber:
                    detrendCountENZ=0
                    #J for loop
                    j=0
                    largest=0
                    smallest=dp
                    while len(valuesTestedENZ)>j:
                        if abs(float(valuesTestedENZ[j])) > abs(largest):
                            largest=float(valuesTestedENZ[j])
                        if abs(float(valuesTestedENZ[j])) < abs(smallest):
                            smallest=float(valuesTestedENZ[j])
                        j+=1
                    valueOutside=False
                    while len(valuesTestedENZ)>j:
                        if largest*1000<smallest*1050:
                            valueOutside=True
                        j+=1
                    if not valueOutside:
                        ENZBaseData=float(dataTotal/dataCount)
                else:
                    valuesTestedENZ[detrendCountENZ]=currentAverage
            #Comments are at the EHZ
            elif 'ENN'==station:#N
                if ((testsDone<4)) and ENNBaseData==0:
                    ENNBaseData=float(dataTotal/dataCount)
                    testsDone+=1
                currentAverage=((math.floor(((float(dataTotal/dataCount)-ENNBaseData)/countsMSa)*(10*dp)))/(10*dp))#Data
                detrendCountENN+=1
                if detrendCountENN==detrendNumber:
                    detrendCountENN=0
                    #J for loop
                    j=0
                    largest=0
                    smallest=dp
                    while len(valuesTestedENN)>j:
                        if abs(float(valuesTestedENN[j])) > abs(largest):
                            largest=float(valuesTestedENN[j])
                        if abs(float(valuesTestedENN[j])) < abs(smallest):
                            smallest=float(valuesTestedENN[j])
                        j+=1
                    valueOutside=False
                    while len(valuesTestedENN)>j:
                        if largest*1000<smallest*1050:
                            valueOutside=True
                        j+=1
                    if not valueOutside:
                        ENNBaseData=float(dataTotal/dataCount)
                else:
                    valuesTestedENN[detrendCountENN]=currentAverage/2
            #Outputs data
            dataToOutput+="~"
            dataToOutput+=str(station)#Station
            dataToOutput+=newSep
            dataToOutput+=str(math.floor((((float(baseTime)-offsetTime)))*1000)/1000)#Time
            dataToOutput+=newSep
            dataToOutput+=str('{0:.10f}'.format(currentAverage))#Data in readible format
            #Cleans old values
            currentAverage=''
            dataTotal=0
            dataCount=0
    elif (i)%(27)!= 1:#If it is a station
        station=str(bitsOfData[i])
        #Prints the data so far every 100000 EHZ peices of data so we can know if the program is working
        if station=='EHZ':
            printer+=1
            if printer%100000 == 0:
                outputFile = open("outputFile.txt", "w")
                outputFile.write(dataToOutput)
                outputFile.close()
    elif (i)%(27)!= 0:
        #Offsets time if time hasnet been defined so far
        if baseTime == "":
            offsetTime=float(bitsOfData[i])
        baseTime=str(bitsOfData[i])
    i+=1
#Outputs data
outputFile = open("outputFile.txt", "w")
outputFile.write(dataToOutput)
outputFile.close()
#Tells me that the program is finished
print("Fin")
