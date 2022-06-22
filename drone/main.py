from ast import Constant
from pickle import FALSE, TRUE
from shutil import move
from face import faceHandler
from djitellopy import Tello
import cv2, time
import geojson
from shapely.geometry import shape, Point

COORD = Point(41.3016, 174.7761)
movequeue = [[]]
tsunamizone = FALSE
tello = Tello()


with open(r'C:\Users\levow\source\repos\CrisisLabs\data.geojson') as i:
    data = geojson.load(i)
    

# Load the cascade

faceCascade=cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def startup():
    tello.connect()
    tello.streamon()
    for feature in data['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(COORD):
            tsunamizone = TRUE


        

def main():
    startup()
    i = 0
    while True:
        frame_read = tello.get_frame_read()
        img = frame_read.frame
        frame2 = faceHandler.findFace(img)
        # Display the resulting frame
        cv2.imshow('Video', frame2)
        #loop break, lands tello and ends opencv instancs
        if cv2.waitKey(1) & 0xFF == ord("q"):
            tello.land()
            cv2.destroyAllWindows()
            break   

        # main movemdent handler. moves tello whenever a new direction is added to moveque
        if movequeue.len() > 0:
            while i < movequeue.len():
                tello.move(movequeue[i])
                del movequeue[i]
                i +=  1
                
        
main()  