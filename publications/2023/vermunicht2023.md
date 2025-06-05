---
layout: publication.njk
title: "802.11 Managemement frames from a public location"
author: Benjamin Vermunicht
date: 2023-06-01
link: https://zenodo.org/records/8003772
publisher: zenodo
type: dataset
bib: /publications/2023/vermunicht2023.bib
thumbnail: "/publications/2023/vermunicht2023.png"
summary: "In this dataset, two separate datasets were recorded in a Belgian train station to collect 802.11 wireless management frames. The datasets were anonymised and contain data on the SSIDs, signal strengths and MAC addresses."
---
The following datasets were captured at a busy Belgian train station between 9pm and 10pm, it contains all 802.11 management frames that were captured. both datasets were captured with approximately 20 minutes between then.

Both datasets are represented by a pcap and CSV file. The CSV file contains the frame type, timestamps, signal strength, SSID and MAC addresses for every frame. In the pcap file, all generic 802.11 elements were removed for anonymization purposes.


## Anonymization

All frames were anonymized by removing identifying information or renaming identifiers. Concretely, the following transformations were applied to both datasets:

* All MAC addresses were renamed (e.g. 00:00:00:00:00:01)
* All SSID's were renamed (e.g. NETWORK\_1)
* All generec 802.11 elements were removed from the pcap

In the pcap file, anonymization actions could lead to "corrupted" frames because length tags do not correspond with the actual data. However, the file and its frames are still readable in packet analyzing tools such as Wireshark or Scapy.

The script which was used to anonymize is available in the dataset.


## Data

| **N/o**                     | **Dataset 1** | **dataset 2** |
|-----------------------------|---------------|---------------|
| Frames                      | 36306         | 60984         |
| Beacon frames               | 19693         | 27983         |
| Request frames              | 798           | 1580          |
| Response frames             | 15815         | 31421         |
| Identified Wi-Fi Networks   | 54            | 70            |
| Identified MAC addresses    | 2092          | 2705          |
| Identified Wireless devices | 128           | 186           |
| Capturetime                 | 480s          | 422s          |


## Dataset contents

The two datasets are stored in the directories `1/` and `2/`. Each directory contains:
* `capture-X.pcap`: an anonymized version of the original capture
* `capture-X.csv`: content of each captured frame (timestamp, MAC address...) saved as a CSV file

`anonymization.py` is the script which was used to remove identifiers.

`README.md` contains the documentation about the datasets