---
layout: publication.njk
title: "Survey on the Privacy and Transparency of Location Data"
author: Maxim Van de Wynckel
date: 2025-05-31
link: https://zenodo.org/records/15564052
publisher: zenodo
type: dataset
bib: /publications/2025/vandewynckel2025survey.bib
thumbnail: "/publications/2025/vandewynckel2025survey.jpg"
summary: "Pseudonymised survey results of our 2025 survey on the privacy and transparency of location data"
---

This dataset contains information about our survey on the “Privacy and Transparency of Location Data”. The survey was launched in January 2025 and was primarily used to determine how users perceive the privacy and transparency of their location data in mobile applications.

## File Structure
- `README.md`: This file.
- `data_pseudonymised.xlsx`: Pseudonymised survey results.
- `data_pseudonymised.csv`: Pseudonymised survey results.
- `images/`: Contains aggregated images of the survey results.
- `screenshots/`: Screenshots of the survey

## `data_pseudonymised.{xlsx,csv}`

### Columns
- `ID`: Identifier of the participant (randomised)
- `Q2` -> `Q29`: Question answers
- `QX_Y`: X is the question, Y is the subquestion
- `Q*_TRANSLATION`: Translation from Dutch for questions where `Q*` was an open question with a Dutch response
- `Origin`: Country code

## Questions

In this section, we list all the questions asked in the survey. We also provide additional context as to why some of these questions were asked. Each question is numbered (e.g., Q5); this is an internal numbering and corresponds to the results presented in [Pseudonymised Results](#pseudonymised-results).

### General Awareness

We began with general questions concerning participants' awareness of location data privacy. Some of these questions also serve as redundant questions for other questions. The possible answers to these questions are sometimes intentionally vague or self-explanatory to encourage participants to think critically about the potential impacts. Additionally, these questions help scope the follow-up questions.

#### \[Q2] How familiar are you with the concept of location data tracking?

Participants were asked about their familiarity with location data tracking. Choices ranged from *"Not at all familiar"* (1) to *"Extremely familiar"* (5).

#### \[Q3] How can services or companies track your physical location? (Tick all that apply)

Options (random order):

1. By sharing my location data using an application
2. Through surveillance cameras
3. By monitoring wireless activity
4. By accessing cloud data
5. Through my visits to websites
6. By intercepting cellular signals
7. Through my social media posts

#### \[Q4] Which of the following applications do you think use your location data? (Tick all that apply)

Options (random order):

1. GPS/Maps applications
2. Social media apps
3. Weather apps
4. E-commerce platforms
5. Ride-sharing or food delivery apps
6. Smart home devices or assistants
7. Travel or airline apps
8. Fitness or health-tracking apps
9. Banking apps
10. E-mail clients
11. Applications to control smart devices
12. None of the above

#### \[Q5] Have you ever installed a navigation application for one specific building?

Context: *For navigating an airport, conference, hospital or any other building*.
Answers: yes, no, or unsure.

#### \[Q6] How often do you check the permissions granted to apps regarding location tracking?

Answers: always, often, sometimes, rarely, never.

#### \[Q7] How often do you read privacy policies when downloading or using apps?

Gauge: 0 (never) to 10 (always).

#### \[Q8] Without checking, what percentage of applications on your smartphone have constant access to your location data?

Context: *Constant access means the app can request your location even when not running*.
Gauge: 0% to 100%.

#### \[Q9] On a scale from 1 to 10, how valuable do you think your location data is to third parties?

Gauge: 1 to 10.

### Privacy Concerns

This set of questions aims to assess any privacy issues associated with location data.

#### \[Q10] Rank the following concerns about location data tracking

Options:

1. Data being shared with third parties
2. Data used for targeted advertising
3. Data being stolen in a breach
4. Lack of transparency about data usage
5. Being monitored by authorities/employers
6. Being monitored by friends/family
7. Denied access due to profiling
8. Apps collecting more information than needed
9. Unclear consent processes
10. Cross-device tracking by third parties

#### \[Q11] How concerned are you about the following scenarios?

Scale: 1 (not at all concerned) to 5 (extremely concerned).
Scenarios:

1. Data sold to third parties
2. Detailed profiling
3. Denial of services due to profiling
4. Unauthorised movement tracking
5. Data vulnerable to breaches

#### \[Q12] Do you feel you have enough control over how your location data is used?

Scale: 1 (definitely not) to 5 (definitely yes).
Follow-up based on answer:

* Why do you feel you need more control?
* Why do you feel you have enough control?

#### \[Q13] Have you ever refused to use an app or service because of privacy concerns?

Yes/No.

#### \[Q14] What actions, if any, do you take to limit location tracking?

Open question.

### Transparency of Applications and Systems

#### \[Q15] How transparent do you believe apps and systems are about location data?

Scale: 1 (strongly disagree) to 5 (strongly agree).
Statements:

1. Apps explain why they need location
2. Privacy policies are easy to understand
3. I feel informed about sharing
4. I know how often apps access my location
5. I understand the impact of declining sharing

#### \[Q16] Would you trust an app more with real-time location access notifications?

Context: *e.g., an icon like when the camera is used*
Options:

1. Yes, much more confident
2. Yes, if not intrusive
3. No, it wouldn’t affect trust

#### \[Q17] If a company misuses location data, how would it affect your behaviour?

Options:

1. Stop using the service
2. Change permissions
3. Switch to a competitor
4. Demand accountability
5. No change in behaviour

#### \[Q18] What’s your preferred way for apps to communicate location policies?

Options:

1. Summary during setup
2. Detailed document
3. Short video
4. Periodic notifications
5. Other (with text field Q18\_TEXT)

#### \[Q19] How comfortable would you be with local storage of location data?

Scale: 1 (extremely uncomfortable) to 5 (extremely comfortable)

### Valuation of Location Data

#### \[Q20] How important is location data to your daily apps?

Options: not at all, slightly, moderately, very, extremely, don’t know.

#### \[Q21] Would you pay for a no-tracking version of an app?

Context: *Disable tracking via fee*
Options: yes, maybe, no

#### \[Q22] What kind of incentive would justify location tracking?

Options:

1. Improved performance/features
2. Personalised content
3. Monetary rewards
4. None
5. Other (Q22\_TEXT)

#### \[Q23] Why do you think companies collect location data?

Options:

1. Improve features
2. Advertising
3. Sell data
4. Analytics
5. Legal compliance
6. UX improvements
7. Other (Q23\_TEXT)

#### \[Q24] How valuable are the following tracking types to third parties?

Scale: 1 (not valuable) to 5 (extremely valuable)
Types:

1. Exact current location
2. Constant movement tracking
3. General area (e.g., city)
4. Past location history
5. Aggregated trends

#### \[Q25] Rank the following personal data by importance

Data types (random order):

* Location data
* Web browsing activity
* Home address
* Phone number
* Email address
* Social media profile
* Health/medical info
* Calendar info
* Photos
* Email messages

### Demographic Information

Only age (\[Q26]) and whether the participant lives in the EU (\[Q27]) were collected to assess the impact of regulations like the GDPR.

## Pseudonymised Results

In total, **58** users participated. Identifiable info (e.g., IP, rough location, timestamps, internal IDs) was removed. Responses were cleaned and randomised. Open answers were reviewed and translated (if in Dutch).

The results highlighted that third-party selling of location data is a major concern. Interoperable positioning systems could offer better transparency and support privacy optimisation in future systems.

## License
This dataset is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. You are free to share and adapt the material for non-commercial purposes, provided you give appropriate credit, indicate if changes were made, and distribute your contributions under the same license.
