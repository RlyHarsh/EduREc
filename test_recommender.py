"""
Unit tests for EduRec cold-start course recommendation engine and data files.
Can be executed directly with `python3 test_recommender.py` or with `pytest`.
"""
import unittest
import json
import os
from recommender import ColdStartCourseRecommender

class TestEduRecRecommender(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.courses_path = os.path.join(self.base_dir, "data", "courses.json")
        self.roadmaps_path = os.path.join(self.base_dir, "data", "roadmaps.json")
        self.insights_path = os.path.join(self.base_dir, "data", "career_insights.json")
        self.recommender = ColdStartCourseRecommender(self.courses_path)

    def test_courses_data_validity(self):
        """Test courses.json has valid structure and required fields."""
        with open(self.courses_path, "r", encoding="utf-8") as f:
            courses = json.load(f)
        self.assertGreater(len(courses), 0)
        for c in courses:
            self.assertIn("id", c)
            self.assertIn("title", c)
            self.assertIn("domain", c)
            self.assertIn("level", c)
            self.assertIn("rating", c)
            self.assertIn("skills", c)
            self.assertIn("pricing_type", c)

    def test_roadmaps_data_validity(self):
        """Test roadmaps.json contains career tracks and milestones."""
        with open(self.roadmaps_path, "r", encoding="utf-8") as f:
            roadmaps = json.load(f)
        self.assertIn("Data Scientist", roadmaps)
        self.assertIn("Machine Learning Engineer", roadmaps)
        self.assertIn("Full Stack Web Developer", roadmaps)

    def test_career_insights_data_validity(self):
        """Test career_insights.json contains salary, time to master, milestones, and AI security data."""
        with open(self.insights_path, "r", encoding="utf-8") as f:
            insights = json.load(f)
        self.assertIn("Data Scientist", insights)
        ds = insights["Data Scientist"]
        self.assertIn("salary_lpa", ds)
        self.assertIn("time_to_master", ds)
        self.assertIn("job_readiness", ds)
        self.assertEqual(len(ds["job_readiness"]["stages"]), 4)

        # Verify AI Security & Future Demand fields exist for roles
        self.assertIn("ai_security_and_market", ds)
        ai_data = ds["ai_security_and_market"]
        self.assertIn("ai_threat_level", ai_data)
        self.assertIn("ai_security_score", ai_data)
        self.assertIn("automation_risk_percent", ai_data)
        self.assertIn("human_moat", ai_data)
        self.assertGreater(len(ai_data["human_moat"]), 0)
        self.assertIn("growth_rate_5yr", ai_data)
        self.assertIn("demand_level", ai_data)
        self.assertIn("supply_level", ai_data)

    def test_recommendation_cold_start(self):
        """Test that cold-start recommendation outputs sorted, valid recommendations."""
        user_profile = {
            "name": "Alex Sharma",
            "target_role": "Data Scientist",
            "experience_level": "Beginner",
            "selected_skills": ["Python", "Machine Learning", "SQL"],
            "interests_text": "I want to learn data analysis, pandas, and predictive modeling."
        }
        recs = self.recommender.recommend(user_profile, top_k=5)
        self.assertGreater(len(recs), 0)
        self.assertLessEqual(len(recs), 5)
        # Verify scores are sorted descending
        scores = [r["match_percentage"] for r in recs]
        self.assertEqual(scores, sorted(scores, reverse=True))
        # Top course should have a high match percentage
        self.assertGreater(scores[0], 40)

    def test_multidisciplinary_coverage(self):
        """Test courses span across all engineering disciplines."""
        with open(self.courses_path, "r", encoding="utf-8") as f:
            courses = json.load(f)
        domains = {c["domain"] for c in courses}
        self.assertIn("Mechanical & Automotive Engineering", domains)
        self.assertIn("Biotechnology & Biomedical Engineering", domains)
        self.assertIn("Electrical & Electronics Engineering", domains)
        self.assertIn("Civil & Infrastructure Engineering", domains)
        self.assertIn("Chemical & Materials Engineering", domains)
        self.assertIn("Aerospace & Aeronautical Engineering", domains)
        self.assertIn("Robotics & Mechatronics Engineering", domains)

    def test_mechanical_student_recommendation(self):
        """Test recommendations tailored to a Mechanical Engineering student."""
        profile = {
            "name": "Rohan Verma",
            "engineering_branch": "Mechanical Engineering",
            "target_role": "Mechanical Design & CAD Engineer",
            "experience_level": "Beginner",
            "selected_skills": ["CAD", "SolidWorks", "Finite Element Analysis"],
            "interests_text": "I want to design 3D parts, do stress analysis in ANSYS, and master GD&T."
        }
        recs = self.recommender.recommend(profile, top_k=5)
        self.assertGreater(len(recs), 0)
        # Top recommendations should be mechanical engineering courses
        top_domains = [r["domain"] for r in recs[:3]]
        self.assertIn("Mechanical & Automotive Engineering", top_domains)
        self.assertTrue(any("CAD" in r["title"] or "ANSYS" in r["title"] or "Finite Element" in r["title"] for r in recs[:3]))

    def test_biotech_student_recommendation(self):
        """Test recommendations tailored to a Biotechnology student."""
        profile = {
            "name": "Priya Nair",
            "engineering_branch": "Biotechnology & Biomedical Engineering",
            "target_role": "Bioinformatics & Computational Biologist",
            "experience_level": "Beginner",
            "selected_skills": ["Bioinformatics", "Genomics", "Sequence Alignment"],
            "interests_text": "I want to analyze DNA sequences, learn Biopython, and do molecular docking."
        }
        recs = self.recommender.recommend(profile, top_k=5)
        self.assertGreater(len(recs), 0)
        top_domains = [r["domain"] for r in recs[:3]]
        self.assertIn("Biotechnology & Biomedical Engineering", top_domains)
        self.assertTrue(any("Bioinformatics" in r["title"] or "Drug Discovery" in r["title"] for r in recs[:3]))

    def test_tokenize_normalization(self):
        """Test tokenization removes punctuation and stops common words."""
        tokens = self.recommender._tokenize("Python, Machine-Learning & SQL!")
        self.assertIn("python", tokens)
        self.assertIn("sql", tokens)

if __name__ == "__main__":
    unittest.main()
