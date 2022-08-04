from face import faceHandler
import cv2, time
video_capture = cv2.VideoCapture(1)

# faceHandler.identifyFacefromfile()
# faceHandler.findFace()
while True:
    ret, frame = video_capture.read()
    frame2 = faceHandler.findFace(frame)
    # Display the resulting frame
    cv2.imshow('Video', frame2)
    #loop break, lands tello and ends opencv instancs
    if cv2.waitKey(1) & 0xFF == ord("q"):
        cv2.destroyAllWindows()
        break   
