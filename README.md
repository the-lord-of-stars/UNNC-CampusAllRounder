# Project Overview: UNNCAllRounder
UNNCAllRounder is a student-led initiative dedicated to centralizing essential information for Computer Science students. Our mission is to provide a clearer, more accessible introduction to the academic journey, helping peers navigate modules, careers, and campus life with confidence.

## Core Feature: Professor Review
The Professor Review platform is a centerpiece of this project. It serves as a practical security learning sandbox where we implement modern web standards to facilitate student feedback.

> **Disclaimer:** UNNCAllRounder is a platform for peer-to-peer sharing. We do not take responsibility for the individual opinions or comments posted by users.

### Technical Privacy & Security
To protect our users while maintaining the integrity of the feedback, we have implemented the following security measures:

1. User ID Salting (via GitHub OAuth)
   Since we use GitHub OAuth for authentication, we do not handle your passwords. However, protecting your identity is our priority.

- What is Salting?: When you log in via GitHub, we receive a unique User ID. Instead of storing this ID directly, we add a random, secret string of characters—a "Salt"—to it before passing it through a hashing algorithm.
- The Result: This ensures that your real GitHub identity is "de-identified" in our database. Even in the event of a data leak, it is computationally impossible for an outsider to reverse-engineer the hash and find out which GitHub account wrote a specific comment.

2. Anonymous Commenting
   We empower students to speak freely through Anonymous Commenting.

- Verified yet Private: By using OAuth, we ensure that every reviewer is a real student (preventing bot spam), while the salting mechanism ensures that your public profile remains hidden from other users.

3. Moderation & Fairness
   To maintain a constructive academic environment, we enforce a strict moderation policy:

- Content Removal: While we support anonymity, we do not tolerate abuse. We reserve the right to delete any comments deemed unjust, defamatory, or purely malicious. 
- Objective Feedback: Our goal is to provide helpful insights for future students, not a platform for personal attacks.
