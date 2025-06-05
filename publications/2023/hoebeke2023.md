---
layout: publication.njk
title: "Object Tracking on a Monopoly Game Board"
author: Nathan Hoebeke
date: 2023-06-01
link: https://zenodo.org/records/7990434
publisher: zenodo
type: dataset
bib: /publications/2023/hoebeke2023.bib
thumbnail: "/publications/2023/hoebeke2023.png"
summary: In this dataset, a Monopoly game was recorded from a first person perspective. The aim of this dataset is to conduct pawn and object tracking using computer vision algorithms.
---
The goal of this dataset was to track game pieces on the physical game board of Monopoly. We make use of object classification where our training data consists of 100 pictures (taken at an angle) of the game board in order to classify the individual (moving) pieces. The training dataset was on the 9th of April 2023 and the test date recorded on the 7th of May 2023 using an iPhone 13 mini and iPhone 12.

Two participants played a game of Monopoly and each individually took pictures of the current game state after every move. These images were then processed by our application to determine the location of pawns and other game pieces such as the red and green houses.

Raw images are unprocessed but may have minor edits to ensure anonymisation of participants in the background. We used [Roboflow](https://roboflow.com/) to label and train our dataset which is included in this repository.

For more information about our processing and this dataset you can download the full Bachelor thesis here: [https://wise.vub.ac.be/thesis/location-tracking-physical-game-board](https://wise.vub.ac.be/thesis/location-tracking-physical-game-board) (download link available after embargo at the end of the academic year)

This dataset was published as part of the bachelor thesis: *Location Tracking on a Physical Game Board* for obtaining the degree of Bachelor in Computer Sciences at the [Vrije Universiteit Brussel](https://vub.be).
