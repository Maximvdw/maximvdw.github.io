---
layout: publication.njk
title: "Chemical Identity Lost in Regulation: A Study of Semantic Interoperability in European Chemical Substance Data"
author: Geert Van Haute, Stijn Goedertier, Pieter Fannes, Maxim Van de Wynckel
date: 2026-09-15
github: https://github.com/gezever/A-Substance-Is-Not-Always-a-Substance
publisher: ceur
type: poster
status: in-press
bib: /publications/2026/vanhaute2026.bib
thumbnail: "/publications/2026/semantics2026chemicalsubstance.png"
summary: European regulatory datasets represent chemical substances heterogeneously. We analyse 18 ECHA-based datasets with a seven-tier linkability taxonomy and show that CAS numbers prove unreliable as unique identifiers, arguing that semantic interoperability requires structural changes at the level of regulatory data modelling and legislation.
---
European regulatory datasets represent chemical substances heterogeneously: CAS numbers, EC numbers, and textual names that may refer to single molecules, mixtures, substance groups, or analytical parameters. We analyse 18 ECHA-based datasets (41,813 records) using a seven-tier linkability taxonomy. Only 62.5% of entries link to a defined molecular structure; 37.5% are non-structure-based. CAS numbers prove unreliable as unique identifiers. Four sentence-embedding models achieve ChemOnt Hit@1 ≤ 5.75%; Claude Sonnet 4.6 reaches 39.2% yet still misclassifies the majority. Structure-defined substances are integrated into a knowledge graph with ChemOnt classification and ChEBI biological roles (~48,400 cross-domain links). For non-structure entries, the LLM abstains from direct classification far more often than for structure-defined substances, appropriately reflecting their lack of a defined structure; a separate LLM-based scope-mapping assessment yields 304 validated SKOS triples linking regulatory group entries to ChemOnt nodes. Semantic interoperability requires structural changes at the level of regulatory data modelling and legislation.
