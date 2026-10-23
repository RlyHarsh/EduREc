# EduRec: Intelligent Cold-Start Course Recommender System

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-black.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0284C7.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Standard%20Lib)-E0F2FE.svg)](server.py)
[![Design](https://img.shields.io/badge/Design-Minimal%20Black%20%26%20Light%20Blue-0F172A.svg)](public/style.css)

EduRec is an intelligent, real-time Course Recommendation and Career Decision Platform specifically engineered to solve the **User Cold-Start Problem** across all major engineering disciplines—from **Mechanical and Automotive**, **Biotechnology and Biomedical**, **Electrical and Electronics (ECE/EEE)**, **Civil and Infrastructure**, **Chemical and Materials**, **Aerospace**, and **Robotics**, to **Computer Science and IT**.

When a brand-new student visits an educational portal, traditional collaborative filtering algorithms fail because the user has no historical enrollments, ratings, or watch times. EduRec solves this at first interaction through a multi-disciplinary onboarding survey that collects the student's engineering discipline, career target, experience level, specific skills, and free-text interests. It processes these inputs through a **TF-IDF Vector Space Model**, computes **Cosine Similarity** against authentic item profiles, calculates **Jaccard skill overlaps**, and applies **knowledge-based level and domain matching**.

Alongside personalized course matches, EduRec equips learners with real-time career market intelligence: **Expected Salary in LPA**, **Estimated Time to Master**, an interactive **0 to Job-Ready 4-Milestone Roadmap**, and a **Free vs. Paid Course Comparison Matrix**.

---

## Key Features

- **Cold-Start Onboarding**: First view captures target role, experience level (Beginner / Intermediate / Advanced), specific skills cloud, and free-text aspirations.
- **Immediate Profile Focus**: Upon sign-in, the user profile renders directly at the top of the viewport with cold-start justification.
- **Career Market Intelligence Bar**:
  - **Expected Salary (LPA)**: Real-time salary ranges for entry, mid, and senior levels (e.g., `₹8.5 - 26 LPA`, `₹9.5 - 60+ LPA`).
  - **Time to Master Skill**: Estimated completion timeline in months and recommended weekly commitment (e.g., `6 - 7 Months`, `10-14 hrs/week`).
  - **0 to Job-Ready Pathway**: An interactive, expandable drawer revealing 4 progressive milestone capstones from Level 0 foundations to deployable, employable portfolio projects.
- **Visual Career Roadmap**: Chronological step-by-step career timeline (Foundations &rarr; Core &rarr; Advanced) with topic badges and matching courses.
- **Free vs. Paid Course Comparison Matrix**: Detailed comparison of free audit tiers vs. paid verified certificates with live pricing filters (`All`, `Free to Audit`, `Paid Certificates`), real ratings, and review counts.
- **Modern Minimalist UI**: Built strictly using **White, Black, and Light Bluish** design elements (`#FFFFFF`, `#000000`, `#0F172A`, `#0284C7`, `#E0F2FE`, `#BAE6FD`). Free of cluttered emojis or third-party branding.
- **Zero-Dependency Architecture**: Built entirely on Python 3 standard libraries (`http.server`, `urllib`, `json`, `math`, `re`, `collections`) for maximum portability across any operating system.

---

## Algorithmic Formulation

EduRec formulates cold-start recommendation as a multi-criteria hybrid scoring function:

$$\text{FinalScore}(u, c) = w_1 \cdot \text{CosineSim}(\mathbf{u}, \mathbf{c}) + w_2 \cdot \text{SkillMatch}(u, c) + w_3 \cdot \text{LevelAffinity}(u, c)$$

Where:
- $w_1 = 0.50$ (Content & Semantic Affinity)
- $w_2 = 0.35$ (Exact Target Skill Overlap)
- $w_3 = 0.15$ (Pedagogical Level Suitability)

### 1. TF-IDF Item & User Profiling
Each course item $c$ is tokenized into a weighted document representing its title, domain, target skills, and curriculum description. Term Frequency ($TF$) and Inverse Document Frequency ($IDF$) are computed as:

$$\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1.0$$

The query vector $\mathbf{u}$ and course vector $\mathbf{c}$ are projected into an $L_2$-normalized vector space:

$$\mathbf{v} = \frac{\mathbf{v}^*}{\|\mathbf{v}^*\|_2} = \frac{\mathbf{v}^*}{\sqrt{\sum_{i} v_i^2}}$$

### 2. Cosine Similarity
The angle between user intentions and course curriculum is computed via exact dot product:

$$\text{CosineSim}(\mathbf{u}, \mathbf{c}) = \mathbf{u} \cdot \mathbf{c} = \sum_{t \in \mathbf{u} \cap \mathbf{c}} u_t \cdot c_t$$

### 3. Skill Overlap (Jaccard Coefficient)
Direct overlap between selected skills $S_u$ and course skills $S_c$:

$$\text{SkillMatch}(u, c) = \frac{|S_u \cap S_c|}{|S_u|}$$

### 4. Pedagogical Level Affinity
A penalty matrix penalizes mismatched difficulty levels (e.g., recommending an Advanced course to an absolute Beginner):

| User Level \ Course Level | Beginner | Intermediate | Advanced |
| :--- | :---: | :---: | :---: |
| **Beginner** | 1.00 | 0.65 | 0.20 |
| **Intermediate** | 0.75 | 1.00 | 0.80 |
| **Advanced** | 0.40 | 0.85 | 1.00 |

---

## Project Structure

```
EduREc/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI workflow (Python 3.9-3.12 matrix)
├── data/
│   ├── courses.json            # 58 curated engineering courses with ratings, prices, and skills
│   ├── roadmaps.json           # 22 multidisciplinary career roadmap tracks and milestones
│   └── career_insights.json    # Salaries (LPA), time to master, 0-to-job-ready milestones for all branches
├── public/
│   ├── index.html              # Clean single-page application layout
│   ├── style.css               # White, black, and light bluish design system
│   └── app.js                  # Client-side state, cold-start logic, and real-time filtering
├── server.py                   # High-performance zero-dependency HTTP server & REST API
├── recommender.py              # Pure Python Cold-Start Recommender (TF-IDF & Cosine Similarity)
├── test_recommender.py         # Complete automated unit test suite
├── requirements.txt            # Python dependencies (core standard lib + optional dev tools)
├── .env.example                # Sample environment template (HOST, PORT, ENVIRONMENT)
├── .gitignore                  # Git ignore rules for Python, IDEs, and OS files
├── LICENSE                     # MIT Open Source License
└── README.md                   # Project documentation
```

---

## Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/RlyHarsh/EduREc.git
cd EduREc
```

### 2. Environment Configuration (Optional)
By default, the server binds to `127.0.0.1:8080`. To customize the host or port, copy `.env.example`:
```bash
cp .env.example .env
```
Or set environment variables directly:
```bash
export HOST=127.0.0.1
export PORT=8080
```

### 3. Run the Application
Because EduRec is engineered with zero external dependencies, you can start the server immediately using Python 3:

```bash
python3 server.py
```

### 4. Open in Browser
Open your browser and navigate to:
```
http://localhost:8080
```

---

## REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/skills` | `GET` | Returns list of all available unique skills across all courses. |
| `/api/courses` | `GET` | Returns all courses in the catalog with pricing and rating metadata. |
| `/api/recommend` | `POST` | Accepts user profile payload and returns ranked recommendations with match percentage and explainability string. |
| `/api/roadmap?role={role}` | `GET` | Returns progressive career stages, topic tags, and matching courses for a target role. |
| `/api/career-insights?role={role}` | `GET` | Returns salary in LPA (entry, mid, senior), time to master, and 0-to-Job-Ready milestone capstones. |

### Sample Recommendation Request:
```bash
curl -X POST http://localhost:8080/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Sharma",
    "target_role": "Data Scientist",
    "experience_level": "Beginner",
    "selected_skills": ["Python", "Machine Learning", "SQL"],
    "interests_text": "I want to build predictive models and analyze business datasets."
  }'
```

---

## Running Automated Tests

Run the included unit test suite:

```bash
python3 test_recommender.py
```

Or using `pytest`:

```bash
pytest test_recommender.py -v
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
