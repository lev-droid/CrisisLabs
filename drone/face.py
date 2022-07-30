import cv2
import face_recognition
from dataclass import face

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
        print("identifying face")
        x = 0
        f = open('facelist.txt', 'a')
        faceHandler.count1 = 4
        # list of our found faces encodings, hold dataclass objects
        faceList = []
        #iterates through the number of found faces
        while x < faceHandler.count1:
            f.write("Starting new iteration of face processing" "w")
            # loads face that correlates to iteration and sets to var "face"
            image = face_recognition.load_image_file( str(x) +'.jpg')
            print("face",x, "is being checked")

            # if a face is found in these images, process it 
            if face_recognition.face_locations(image):
                # encode the image
                new_encoding = face_recognition.face_encodings(image)[0]
                #check if the face already exists in the list if the list is not empty                
                if len(faceList) > 0:
                    for y in faceList:
                        print("checking face against facelist " + str(y))
                        results = face_recognition.compare_faces([y.encoding], new_encoding)
                        if (results[0]):
                            print("face already exists")
                            break   
                    # if the face does not exist, push it to new file
                    else:
                        
                        faceList.append(face(new_encoding, x ))
                        f.write(" | Unique face found in image, image: " + str(x) + ".jpg")
                        print("face found!")
                      
                    x+=1
                #if their are no face encodings saved, save first one.
                else: 
                    faceList.append(face(new_encoding, x ))
                    f.write("Unique face found in image, image: " + str(x) + ".jpg")
                    print("face found!")
                    x+=1
            else:
                  x+=1

                



