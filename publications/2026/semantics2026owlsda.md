---
layout: publication.njk
title: "OWL-SDA: A Multi-Agent System for Generating Synthetic Data to Support Ontology Evaluation"
author: Maxim Van de Wynckel, Emmelien De Roock
date: 2026-09-15
github: https://github.com/milieuinfo/owl-sda
publisher: ceur
type: poster
pdf: https://solid.maximvdw.be/publications/2026/TODO
bib: /publications/2026/TODO.bib
#link: https://ceur-ws.org/Vol-3947/short2.pdf
thumbnail: "/publications/2024/sosy2024maxim.png"
website: https://purl.org/owl-sda
summary: In this paper, we present OWL-SDA, an OWL-based synthetic data generator using a multi-agent architecture for documenting and evaluating ontologies.
---
Ontology engineers often need representative RDF instances to validate and document an ontology, but such data may be unavailable, incomplete, too sensitive to share or simply too much work to create manually. We present OWL-SDA, an open-source toolkit that uses worker, supervisor and reviewer AI agents to generate synthetic RDF data from ontology context and SHACL constraints. The workflow combines shape-level task decomposition, direct manipulation of an in-memory triple store, iterative SHACL repair and a final review stage aimed at catching issues that remain possible even after SHACL conformance. We evaluate OWL-SDA on two contrasting ontologies, one for industrial emissions reporting and one for healthcare records. The results show that richer ontology constraints lead to faster convergence and more informative examples, while sparse ontologies require more supervision and still yield less detailed data. We therefore position the toolkit for ontology engineers to help document their ontology, but also to validate if the ontology alone is sufficiently rich to be understood by non-experts.
