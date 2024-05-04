import cv2
import face_recognition
from dataclass import face
import numpy as np

# pip install opencv-python | https://pypi.org/project/opencv-python/
# pip3 install face_recognition | https://github.com/ageitgey/face_recognition

# load our serialized model from disk
print("[INFO] loading model...")
net = cv2.dnn.readNetFromCaffe("deploy.prototxt.txt", "res10_300x300_ssd_iter_140000.caffemodel")
faceCascade=cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
video_capture = cv2.VideoCapture(0)

# define facehandler class
class faceHandler:
    #global iterator for class
    count1 = 0 
    #variable to store init face encoding
    my_face_encoding = [None]
    #findface method.
    def findFace(img):
        # Capture frame-by-frame    
        # load the input frame and construct an input blob for the image
        # by resizing to a fixed 300x300 pixels and then normalizing it
    
        blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0,
            (300, 300), (104.0, 177.0, 123.0))
        (h, w) = img.shape[:2]

        # predictions
        net.setInput(blob)
        detections = net.forward()

       # loop over the detections
        for i in range(0, detections.shape[2]):
            # extract the confidence (i.e., probability) associated with the
            # prediction
            confidence = detections[0, 0, i, 2]
            # filter out weak detections by ensuring the `confidence` is
            # greater than the minimum confidence
            
            if confidence < 0.25:
                continue
            # compute the (x, y)-coordinates of the bounding box for the
            # objects
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            print("[INFO] computing object detections...")

            # draw the bounding box of the face along with the associated
            # probability
            text = "{:.2f}% | human".format(confidence * 100)
            y = startY - 10 if startY - 10 > 10 else startY + 10
            cv2.rectangle(img, (startX, startY), (endX, endY),
                (0, 0, 255), 2)
            cv2.putText(img, text, (startX, y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 2)

            cv2.imwrite(str(faceHandler.count1)+'.jpg', img) #save the image
            #since a face has been found, iterate the facehandler count by one.
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

                



