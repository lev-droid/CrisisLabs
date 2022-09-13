from pickle import FALSE, TRUE

from djitellopy import Tello
import cv2, time
import threading
import requests
import geojson
from shapely.geometry import shape, Point
from move import movement
from face import faceHandler
from speaker import SoundHandler
from listener import request


COORD = Point(41.3016, 174.7761)
movequeue = [[]  ]
tsunamizone = FALSE
tello = Tello()
earthquake = FALSE
threat = 0
stop_threads = FALSE
#
with open('data.geojson') as i:
    data = geojson.load(i)
    

# Load the cascade

def poll():
    global threat
    global stop_threads
    print("polling")
    while TRUE:
        time.sleep(1) 
        threat = request.listen()
        if (stop_threads):
            break

x = threading.Thread(target=poll)


def startup():
    tello.connect()
    tello.streamon()
    for feature in data['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(COORD):
            tsunamizone = TRUE
    x.start()
        
        

def main():
    startup()
    i = 0
    while True:
        #frame_read = tello.get_frame_read()
       # img = frame_read.frame
       # frame2 = faceHandler.findFace(img)
        # Display the resulting frame
       # cv2.imshow('Video', frame2)
        #loop break, lands tello and ends opencv instancs
        if cv2.waitKey(1) & 0xFF == ord("q"):
            tello.land()
            stop_threads = True
            x.join()
            cv2.destroyAllWindows()
            break   

        if(threat == 1 ):
                SoundHandler.playSound(1)
                print("playing sound")
                movement.takeoff(tello)
                while(threat ==1 ):
                    movement.move(1, tello)
                        
        if(threat == 2):
                SoundHandler.playSound(2)
               # movement.move(2, tello)
                        
        if(threat == 3):
             #   movement.move(3, tello)
                if (tsunamizone):
                    SoundHandler.playSound(3)


main()

    
        
