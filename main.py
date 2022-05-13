from ast import Constant
from pickle import FALSE, TRUE
from shutil import move
from djitellopy import Tello
import logging
import threading
import cv2, time
from numpy import true_divide
import geojson
from shapely.geometry import shape, Point

COORD = Point(41.3016, 174.7761)
FRAMEWIDTH = 1280
FRAMEHEIGHT = 720
movequeue = [[]]
tsunamizone = FALSE

with open(r'C:\Users\levow\source\repos\CrisisLabs\data.geojson') as i:
    data = geojson.load(i)
    

# Load the cascade
face_cascade=cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml") #Note the change

for feature in data['features']:
    polygon = shape(feature['geometry'])
    if polygon.contains(COORD):
        tsunamizone = TRUE

tello = Tello()

tello.connect()
tello.streamon()


def imgshow():
    while True:
        frame_read = tello.get_frame_read()
        img = frame_read.frame
        img.set(3, FRAMEWIDTH)
        img.set(4, FRAMEHEIGHT)
        col = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face = face_cascade.detectMultiScale(col, 1.1, 4)
        for (x, y, w, h) in face:
            cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 0), 2)

        cv2.imshow("drone", img)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break   

x = threading.Thread(target=imgshow)
     
def main():
    
    for feature in data['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(COORD):
            print( 'Within earthquake zone:', feature)
    x.start()
    i = 0
    while True:
        #loop break, lands tello and ends opencv instancs
        if cv2.waitKey(1) & 0xFF == ord("q"):
            tello.land()
            break   
        
        # main movemdent handler. moves tello whenever a new direction is added to moveque
        if movequeue.len() > 0:
            while i < movequeue.len():
                tello.move(movequeue[i])
                del movequeue[i]
                i +=  1
                
        


main()  
