import os
import requests
import time
import pathlib


directory= pathlib.Path().absolute()
url= "http://localhost:3000/saveData"
while(True):
    for filename in os.listdir(directory):
        if filename.endswith(".csv"):
            temp = {'file': open(filename, 'rb')}
            r = requests.post(url, files=temp)
            print(filename +" uploaded");
            continue
        else:
            continue
        
    time.sleep(3600)
