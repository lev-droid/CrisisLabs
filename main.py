from ast import Constant
from pickle import FALSE, TRUE
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
    

face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
cap = cv2.VideoCapture(0)
cap.set(3, FRAMEWIDTH)
cap.set(4, FRAMEHEIGHT)

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
                tello.move(movequeue[i][i])
                i +=  1


main()  
