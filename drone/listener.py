
import requests
import cv2

class request:
    def listen():
        r = requests.get("http://localhost:4000/risk")
        print(r.text)
        return int(r.text)
    
