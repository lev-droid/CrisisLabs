from djitellopy import Tello
earthquake = False
class movement:
    def takeoff(telloHandle):
        telloHandle.takeoff()

    def move(mode, telloHandle):
        if mode == 1:
            telloHandle.rotate_clockwise(30)

        if mode == 2:
            telloHandle.move_forward(90)
            telloHandle.move_right(90)
            telloHandle.move_back(90)
            telloHandle.move_left(90)

        if mode == 3:
            telloHandle.land()
        
        