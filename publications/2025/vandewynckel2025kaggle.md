---
layout: publication.njk
title: "Garage Positioning Dataset"
author: Maxim Van de Wynckel
date: 2025-02-12
link: https://www.kaggle.com/datasets/maximvandewynckel/garage-positioning-dataset
publisher: kaggle
type: dataset
bib: /publications/2025/vandewynckel2025kaggle.bib
thumbnail: "/publications/2025/vandewynckel2025kaggle.jpg"
summary: "A fingerprinting dataset consisting of WLAN, BLE and IMU data in a garage"
---
- For this dataset we split up a room in **45 points** (with centimetre coordinates in our dataset). 
- The room has the following dimensions: 500cm * 350cm
- For each point, we record the dataset at 60cm height.
- For each point, we perform data collection in four directions (indicated with the column ```ORIENTATION```). This means the total amount of data points collected is 45 * 4.
- Each set of data (every direction for every point) takes approximately 30 seconds
- We use a smartphone to collect the data (Samsung S20 FE)
- Our mobile phone collects information about the accelerometer (`ACC_`), gyroscope (`RRATE_`), magnetometer (`MAG_`) and computed pitch, roll, yaw. 
- Our mobile phone also collects the received signal strength (`RSSI`) of 4 Bluetooth beacons and all Wi-Fi access points in range (denoted using `WLAN_` as columns). 
- If an access point was not in range, its value was set to 100 (NOTE: 100 RSSI is invalid, it should always be negative)
- The Bluetooth beacons have the following coordinates (x, y, z):
    - Beacon 1: (0, 0, 150)
    - Beacon 2: (450, 0, 150)
    - Beacon 3: (250, 316, 150)
    - Beacon 4: (0, 316, 150)
- Raw results are unprocessed apart from renaming the WLAN access points MAC addresses to pseudonymise the results.
- 66 WLAN access points were detected