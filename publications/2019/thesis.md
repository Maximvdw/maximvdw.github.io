---
layout: publication.njk
title: "Indoor Navigation by Centralized Tracking"
author: Maxim Van de Wynckel
date: 2019-07-01
pdf: https://solid.maximvdw.be/publications/Masterthesis_MaximVandeWynckel.pdf
type: thesis
excerpt: 'Van de Wynckel, M.: "Indoor Navigation by Centralized Tracking", July 2019'
thumbnail: "/publications/2020/techreport.png"
eleventyExcludeFromCollections: true
---
The main goal of this thesis is to create an indoor positioning system that guides a patient or visitor through a hospital building. Using only the smartphone of a person, the system should be able to track and guide the user to his/her destination. Unlike other possible solutions that focus on the smartphone application to determine the position, the proposed solution uses a centralized server with Bluetooth scanners.

These scanners are distributed throughout the hospital and report their scan results back to the centralized server for position calculation and navigation instruction generation. Finally, these instructions are sent to the smartphone application to guide the user to his/her destination. Apart from starting the transmission of a Bluetooth signal, the task of the smartphone application is limited to receiving and displaying these navigation instructions.

The centralized server approach provides companies that implement this system, complete control over which other functionalities to implement related to the determined location of the end-user (i.e. the patient or visitor). For instance, companies can trigger actions based on the end-user’s location such as automatic registration when a user arrives at their destination or use it to track assets.

Starting from a comparison of existing positioning techniques, such as beacons or Wi-Fi positioning, this thesis gradually explains how the system can track a smartphone; how both visual and textual navigation instructions are created and the pros and cons of using this system in a hospital environment.

To achieve the goal of the thesis, first theoretical research was needed to come to a possible solution. Next, the solution was implemented, i.e. software was created. The software implementation shows the feasibility of the positioning approach as well as the navigation approach.
