# MeReNGO - Concept Norming Web Application

## Introduction

The MeReNGO web app is a tool developed for assessing the conceptual knowledge of 6-8-year-old Hungarian children. This is a crucial step of the MeReNGO Study, which aims to investigate the hippocampal contributions to knowledge representation in children. The study is conducted by the HCCCL (Hippocampal Circuit and Code for Cognition Lab) in the HUN-REN Research Center for Natural Sciences, based in Budapest, Hungary.

## Aim

Data acquision for creating a concept norm on McRae et al. (2005) for 6-8-year-old Hungarian children.

## Design

### Stimuli

- **300 concepts** selected from the Hungarian National Corpus (Oravecz, 2021), the Hugnarian CHILDES MacArthur-Bates Corpus (Fenson et al., 2012), and the MRC Pchycholingusitic Database (Wilson, 1988),
- All concepts are assigned to one of **ten categories**, each with 20, 30, or 40 concepts in them: _animals_, _body parts_, _clothes_, _foods_, _locations_, _people_, _plants_, _tools_, _toys_, _vehicles_. The categorieswereestablished using the WordNet Lexical Database (Fellbaum, 1998) and with NLTK (Loper & Bird, 2002),
- All concepts are assigned a **thematic subcategory** (e.g. _cooking_) to minimize the semantic priming effect. The thematic subcategories were established by using the word2vec (Mikolov et al., 2013) word embeddings of theconcepts and theircosine similarites,
- The final stimuli list was created by prioritizing concepts with earlier age of acquisitions and higher frequencies of apperance in developmental databases and corpora (e.g., Kuperman et al., 2012; Fenson et al., 2012).

### Paradigm

To ensure both reliability and ecological validity in data collection, we adhere to best practices in concept norm research:

- Each concept will be validated by responses from **at least 20 children** (Devereux et al., 2014; Vivas et al., 2017; Deng et al., 2021; Borovsky et al., 2024), thus the web platform dynamically prioritizes concepts with fewer responses to balance data collection,
- A demographic-based balancing mechanism will help distribute response counts evenly across user reach,
- We encourage each child to list **at least 10 features per concept**, following McRae et al. (2005),
- If a child struggles to generate 10 features, category specific guiding cues (e.g., “What is [concept] made of?”) can be provided to assist recall (Deng et al., 2021),
- In our instructions we emphasize that we collect features, not associations,
- There are 2 settings in which the app can be used: **Experimenter Setting (ES)** and **Home Setting (HS)**.

#### Experimenter Setting (ES)

- To be used in an experiment setting with one child at a time, conducted by an expert experimenter,
- Demographic data is being collected directly before the task,
- A child is presented 10 concepts, one from each category (There is an option to skip a concept. Skipped concepts do not count towards this rule.),
- Each thematic subcategory is only presented once, even if a concept is skipped (Vinson & Vigliocco, 2008; Vivas et al., 2017).

#### Home Setting (HS)

- To be used by an adult care-taker monitoring/helping,
- Each child being presented 10 concepts per a daily session, one from each category (There is an option to skip a concept. Skipped concepts do not count towards this rule.),
- In a single session each thematic subcategory is only presented once, even if a concept is skipped (Vinson & Vigliocco, 2008; Vivas et al., 2017),
- Priority is given to concepts with the fewest responses,
- Once the 10 concepts are completed, no further concepts will be available for the day to prevent priming effects.

### The web-app

#### Design

- Task instructions are given my a fantasy creature named Mimo, who comes from a mystical world and seeks to learn human concepts,
- The design evokes a fantasy land, in which the appearance and the narrative resembles a fairy tale.

#### Features

##### Main Task: Teaching concepts to Mimo

Concept Presentation & Response Collection:

- Introductory video aimed towards adults explaining the overarching goals,
- Short animated story aimed towards the children to provide immersion,
- A "tutorial" section highlighting the sequence and presenting the UI,
- Responses can be provided via microphone or text input:
  - Microphone recordings - limited to 120 seconds (4 times),
  - Text input - up to 20 responses.
- Prompt questions are readily available with a button press as a pop-over. This is to make sure that the questions do not interfere with the response production of children,
- After response submission one of three potential options happen:
  - Feedback screen appears with an encouraging message,
  - A 1-7 Likert-scale screen appears (only in case of text input) for the care-taker, to assess the amount of assistance they provided in the previous couple of answers,
  - Direct presentation of the next concept.
- During the task, the real time daily answer count is visible above the task instructions,
- Help popover available with cues about the UI.
- AI-assisted voiceover for Mimo plays for all interactions.

##### Additional Features:

- Home: Introductory video and further information is provided about the app,
- Registration & login: Used in HS; demographic data collected during registration; email-verification; terms of service agreement
- About us: Further information about the study & support messages,
- Dashboard: Main hub highlighting daily progress,
- Concept history (Sticker collection): Virtual stickers as incentive for the children; given after each submitted concept,
- Password change,
- Personal data: Demographic data can be viewed here and potentially modified by the user
- Delete account: Optional deletion of all acquired data,

#### Technical Information

##### Front-end

- Next.js
- Tailwind CSS, ChakraUI

##### Back-end

- Firebase Storage: activity log files; voice recordings
- Firebase Realtime Database: concepts + answers
- Firebase Firestore Database: demographic data + additional user data
- Firebase Authentication
- Vercel: serverless deployment

## References

Borovsky, A., Peters, R. E., Cox, J. I., & McRae, K. (2024). Feats: A database of semantic features for early produced noun concepts. Behavior Research Methods, 56(4), 3259–3279. https://doi.org/10.3758/s13428-023-02242-x

Deng, Y., Wang, Y., Qiu, C., Hu, Z., Sun, W., Gong, Y., Zhao, X., He, W., & Cao, L. (2021). A Chinese Conceptual Semantic Feature Dataset (CCFD). Behavior Research Methods, 53(4), 1697–1709. https://doi.org/10.3758/s13428-020-01525-x

Devereux, B. J., Tyler, L. K., Geertzen, J., & Randall, B. (2014). The Centre for Speech, Language and the Brain (CSLB) concept property norms. Behavior Research Methods, 46(4), 1119–1127. https://doi.org/10.3758/s13428-013-0420-4

Fenson, L., Marchman, V. A., Thal, D. J., Dale, P. S., Reznick, J. S., & Bates, E. (2012). MacArthur-Bates Communicative Development Inventories, Second Edition [Dataset]. https://doi.org/10.1037/t11538-000

Kuperman, V., Stadthagen-Gonzalez, H., & Brysbaert, M. (2012). Age-of-acquisition ratings for 30,000 English words. Behavior Research Methods, 44(4), 978–990. https://doi.org/10.3758/s13428-012-0210-4

Loper, E., & Bird, S. (2002). NLTK: The Natural Language Toolkit (arXiv:cs/0205028). arXiv. https://doi.org/10.48550/arXiv.cs/0205028

McRae, K., Cree, G. S., Seidenberg, M. S., & Mcnorgan, C. (2005). Semantic feature production norms for a large set of living and nonliving things. Behavior Research Methods, 37(4), 547–559. https://doi.org/10.3758/BF03192726

Mikolov, T., Sutskever, I., Chen, K., Corrado, G. S., & Dean, J. (2013). Distributed representations of words and phrases and their compositionality. Advances in neural information processing systems, 26. https://doi.org/10.48550/arXiv.1310.4546

Oravecz C. (2021). A Magyar nemzeti szövegtár. [The Hungarian National Corpus. From corpus linguistics to neural networks].: Vol. A korpusznyelvészettől a neurális hálókig. Nyelvtudományi Kutatóközpont.

Vinson, D. P., & Vigliocco, G. (2008). Semantic feature production norms for a large set of objects and events. Behavior Research Methods, 40(1), 183–190. https://doi.org/10.3758/BRM.40.1.183

Vivas, J., Vivas, L., Comesaña, A., Coni, A. G., & Vorano, A. (2017). Spanish semantic feature production norms for 400 concrete concepts. Behavior Research Methods, 49(3), 1095–1106. https://doi.org/10.3758/s13428-016-0777-2

Wilson, M. (1988). MRC psycholinguistic database: Machine-usable dictionary, version 2.00. Behavior Research Methods, Instruments, & Computers, 20(1), 6–10. https://doi.org/10.3758/BF03202594
