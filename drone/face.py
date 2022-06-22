from dataclasses import dataclass
from itertools import count
import cv2
import sys
import face_recognition
from dataclass import face
from numpy import std, void

faceCascade=cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
video_capture = cv2.VideoCapture(0)


class faceHandler:
    count1 = 0 
    my_face_encoding = [None]
    def findFace(img):
        # Capture frame-by-frame
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        # Draw a rectangle around the faces
        for (x, y, w, h) in faces:
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
            crop_face = img[y:y+h, x:x+w]
            cv2.imwrite(str(faceHandler.count1)+'.jpg', crop_face) #save the image
            faceHandler.count1 +=1
        return(img)

    def identifyFacefromfile(): 
        x =0
        list = [] 

        while x < faceHandler.count1:
          image = face_recognition.load_image_file(str(faceHandler.count1)+'.jpg')
          if face_recognition.face_locations(image):
            new_encoding = face_recognition.face_encodings(image)[0]
            for value in list.__dict__.iteritems():
                if value == new_encoding:
                    break
            else:
                list.append(face(face_recognition.face_encodings(image)[0],x ))

            x+=1


            

                     
                
                            


                
# When everything is done, release the capture
