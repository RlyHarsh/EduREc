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
        """Test career_insights.json contains salary, time to master, and milestones."""
        with open(self.insights_path, "r", encoding="utf-8") as f:
            insights = json.load(f)
        self.assertIn("Data Scientist", insights)
        ds = insights["Data Scientist"]
        self.assertIn("salary_lpa", ds)
        self.assertIn("time_to_master", ds)
        self.assertIn("job_readiness", ds)
        self.assertEqual(len(ds["job_readiness"]["stages"]), 4)

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

    def test_tokenize_normalization(self):
        """Test tokenization removes punctuation and stops common words."""
        tokens = self.recommender._tokenize("Python, Machine-Learning & SQL!")
        self.assertIn("python", tokens)
        self.assertIn("sql", tokens)

if __name__ == "__main__":
    unittest.main()
