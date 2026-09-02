---
layout: publication.njk
title: "ODDToolkit: An Open-Source Toolkit to Help Bridge the Developer Gap in Ontology Driven Design"
author: Maxim Van de Wynckel, Geert Van Haute
date: 2026-09-15
github: https://github.com/milieuinfo/oddtoolkit
publisher: ceur
type: poster
status: in-press
bib: /publications/2026/vandewynckel2026oddtoolkit.bib
#link: https://ceur-ws.org/Vol-3947/short2.pdf
thumbnail: "/publications/2026/semantics2026oddtoolkit.png"
website: https://purl.org/oddtoolkit
summary: In this paper, we present ODDToolkit, an open-source toolkit for generating developer-facing artefacts such as diagrams and Java classes from a governed ontology.
---
Linked open data remains difficult to operationalise for software teams when OWL-based models are documented primarily for ontology engineers rather than for implementers. Furthermore, maintaining documentation for implementers becomes time consuming when the ontology is under development. We present ODDToolkit, an open-source Ontology Driven Design toolkit that helps generate developer-facing artefacts from three inputs: an OWL ontology, a SKOS concept scheme that provides business-specific names, and a configuration file for developer-specific design choices. The toolkit emits SQL DDL, Java and TypeScript models, SHACL shapes, diagrams, and documentation. Our design goal is not to fully automate translation of arbitrary vocabularies, but to achieve repeatable regeneration of implementation artefacts as an ontology evolves. We summarise the pipeline and report its use in a Flemish government environmental reporting project, where the generated artefacts supported implementation, documentation, and validation around a shared ontology as it evolves.
