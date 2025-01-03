---
layout: "presentation.njk"
type: presentation
title: "Presentation at FOSDEM 2022"
excerpt: "Presentation titled 'Rapid Prototyping of a Positioning System Using the OpenHPS Framework'"
speaker: "Maxim Van de Wynckel"
date: "2022-02-06"
venue:
    name: "FOSDEM 2022"
    location: "Brussels, Belgium"
event: "https://archive.fosdem.org/2022/schedule/event/lt_openhps/"
slides: "https://openhps.org/slides/fosdem2022"
thumbnail: "/presentations/2022/fosdem.svg"
publication: "/publications/2020/openhps2020"
video: https://video.fosdem.org/2022/L.lightningtalks/lt_openhps.webm
---
The creation of a positioning system has use cases for indoor, outdoor and even small-scale deployments. These solutions often use a broad range of technologies and algorithms that each have their advantages as well as limitations. Existing open source positioning solutions often offer a complete package for indoor navigation or asset tracking that allows developers to set up a specific application with minimal effort. However, these positioning solutions offer little room for developers to customise them.

OpenHPS is an open source hybrid positioning framework for creating a positioning system without being bound to a specific technology or a set of algorithms. Developers are free to choose the data they want to use, from where they want to obtain this data, how to process the data and finally how to use the outcome of the positioning system. In this presentation we will present the modularity and ecosystem around the OpenHPS framework, some technical aspects as well as the current state of the project.

A localisation system often has use cases such as tracking employees or navigating people at a conference. When looking at the problem in a more broader perspective the use cases often span way beyond the tracking and navigation of people. Whether it is a use case where pawns need to be tracked on chessboard or a robot needs to navigate itself outside and through multiple buildings, different approaches need to be used.

Using use case specific software development kits would be an easy solution for developers, but with the constantly changing technologies and algorithms these different platforms cause a fragmentation of knowledge over multiple programming languages and hardware. Being created in TypeScript, the framework can be deployed on a variety of devices while making use of the large number of packages that are available. A process network design is used to process data from a source to sink. The processing can be done locally, remote and even distributed over multiple processes, web workers or remote machines. Each part of the process network is modular, allowing developers to share algorithms that will be compatible with the same data structure used throughout the framework. In addition, this process network design allows existing algorithms in different programming languages to be accessed as 'part of the processing'.

With the OpenHPS project we want to create an ecosystem of modules that each focus on a specific aspect in the creation of a positioning system. Modules for different storage techniques, remote communication, computer vision and different sensor sources already exist that will be further discussed in the current state part of the presentation. At its core, the framework is aimed towards developers that have a basic understanding of implementing a positioning system by means of combining parts of the process network. This method of development allows the rapid prototyping of a complete positioning system that can later on be deployed in a production environment.

Future work in the project will create additional layers of abstraction that allows the development of a system without the required knowledge of the algorithms. However, because the framework is still modular at its core, these abstractions will still allow developers to tweak the system to do the task it is designed to do.