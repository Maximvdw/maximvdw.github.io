---
layout: publication.njk
title: "OpenHPS: An Open Source Hybrid Positioning System"
author: Maxim Van de Wynckel, Beat Signer
date: 2020-12-29
pdf: https://solid.maximvdw.be/publications/openhps-an-open-source-hybrid-positioning-system.pdf
link: https://arxiv.org/abs/2101.05198
bib: /publications/2020/vandewynckel2020.bib
website: https://openhps.org
publisher: arxiv
type: tech-report
github: https://github.com/OpenHPS
video: https://video.fosdem.org/2022/L.lightningtalks/lt_openhps.webm
thumbnail: "/publications/2020/openhps2020.png"
summary: In this technical report, we provide a technical overview of the OpenHPS framework. OpenHPS is a framework to design a wide range of hybrid positioning systems using TypeScript.
---
Positioning systems and frameworks use various techniques to determine the position of an object. Some of the existing solutions combine different sensory data at the time of positioning in order
to compute more accurate positions by reducing the error introduced by the used individual positioning techniques. We present OpenHPS, a generic hybrid positioning system implemented in
TypeScript, that can not only reduce the error during tracking by
fusing different sensory data based on different algorithms, but also
also make use of combined tracking techniques when calibrating
or training the system. In addition to a detailed discussion of the
architecture, features and implementation of the extensible open
source OpenHPS framework, we illustrate the use of our solution in
a demonstrator application fusing different positioning techniques.
While OpenHPS offers a number of positioning techniques, future
extensions might integrate new positioning methods or algorithms
and support additional levels of abstraction including symbolic
locations.