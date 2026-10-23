import json
import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple

class ColdStartCourseRecommender:
    def __init__(self, courses_file_path: str):
        with open(courses_file_path, "r", encoding="utf-8") as f:
            self.courses: List[Dict[str, Any]] = json.load(f)
            
        self.stop_words = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
            "by", "can", "did", "do", "does", "doing", "don", "down", "during", "each", "few", "for",
            "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
            "him", "himself", "his", "how", "if", "in", "into", "is", "it", "its", "itself", "just",
            "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
            "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
            "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
            "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
            "while", "who", "whom", "why", "with", "you", "your", "yours", "yourself", "yourselves"
        }
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        tokens = re.findall(r"\b[a-zA-Z0-9_+#.-]+\b", str(text).lower())
        return [t for t in tokens if t not in self.stop_words and len(t) > 1]

    def _build_index(self):
        """
        Builds Item Profiles using TF-IDF Vector Space Model.
        """
        self.doc_tokens = []
        df_counts = Counter()
        N = len(self.courses)

        for course in self.courses:
            skills_text = " ".join(course.get("skills", []))
            # Weight skills and domain higher in the item document
            combined_text = f"{course['title']} {course['domain']} {skills_text} {skills_text} {course['description']}"
            tokens = self._tokenize(combined_text)
            self.doc_tokens.append(tokens)
            
            for term in set(tokens):
                df_counts[term] += 1

        self.vocabulary = {term: idx for idx, (term, count) in enumerate(df_counts.items()) if count >= 1}
        self.idf = {}
        for term, idx in self.vocabulary.items():
            df = df_counts[term]
            self.idf[term] = math.log((1 + N) / (1 + df)) + 1.0

        # Vectorize each course item
        self.course_vectors = [self._vectorize_tokens(tokens) for tokens in self.doc_tokens]

        # Extract all unique skills sorted
        all_skills_set = set()
        for course in self.courses:
            for s in course.get("skills", []):
                all_skills_set.add(s)
        self.all_skills = sorted(list(all_skills_set))

    def _vectorize_tokens(self, tokens: List[str]) -> Dict[str, float]:
        if not tokens:
            return {}
        counts = Counter(tokens)
        total = len(tokens)
        vec = {}
        norm_sq = 0.0
        
        for term, cnt in counts.items():
            if term in self.vocabulary:
                tf = cnt / total
                tfidf = tf * self.idf[term]
                vec[term] = tfidf
                norm_sq += tfidf * tfidf

        # L2 Normalization
        norm = math.sqrt(norm_sq)
        if norm > 0:
            for term in vec:
                vec[term] /= norm
        return vec

    def _cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """
        Computes exact Cosine Similarity: cos(u, v) = (u . v) / (||u|| * ||v||)
        Since vectors are already L2 normalized, this equals the dot product.
        """
        dot = 0.0
        # Iterate over smaller dict
        if len(vec_a) > len(vec_b):
            vec_a, vec_b = vec_b, vec_a
            
        for term, val_a in vec_a.items():
            if term in vec_b:
                dot += val_a * vec_b[term]
        return max(0.0, min(1.0, dot))

    def _calculate_skill_overlap(self, user_skills: List[str], course_skills: List[str]) -> Tuple[float, List[str]]:
        if not user_skills:
            return 0.0, []
        user_skills_clean = [s.strip().lower() for s in user_skills]
        course_skills_clean = [s.strip().lower() for s in course_skills]

        matched = []
        for us in user_skills_clean:
            for cs in course_skills:
                if us in cs.lower() or cs.lower() in us:
                    if cs not in matched:
                        matched.append(cs)
                    break
                    
        overlap_score = len(matched) / max(1, len(user_skills))
        return min(1.0, overlap_score), matched

    def _level_affinity(self, user_level: str, course_level: str) -> float:
        if not user_level or user_level == "All Levels":
            return 1.0
        user_level = user_level.lower()
        course_level = course_level.lower()

        if user_level == course_level:
            return 1.0
        if user_level == "beginner":
            return 0.75 if course_level == "intermediate" else 0.35
        if user_level == "intermediate":
            return 0.85 if course_level in ["beginner", "advanced"] else 0.5
        if user_level == "advanced":
            return 0.90 if course_level == "intermediate" else 0.5
        return 0.5

    def recommend(
        self,
        profile_or_role: Any = "",
        experience_level: str = "Beginner",
        selected_skills: List[str] = None,
        interests_text: str = "",
        engineering_branch: str = "",
        top_k: int = 15,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Solves the User Cold-Start Problem across all engineering disciplines by constructing
        a rich user requirement vector and executing Content-Based + Knowledge-Constraint scoring in real-time.
        """
        if isinstance(profile_or_role, dict):
            profile = profile_or_role
            target_role = profile.get("target_role", "")
            experience_level = profile.get("experience_level", experience_level)
            selected_skills = profile.get("selected_skills", selected_skills) or []
            interests_text = profile.get("interests_text", interests_text)
            engineering_branch = profile.get("engineering_branch", engineering_branch)
            top_k = kwargs.get("top_k", top_k)
        else:
            target_role = str(profile_or_role or "")

        selected_skills = selected_skills or []
        skills_str = " ".join(selected_skills)
        user_query_text = f"{target_role} {target_role} {engineering_branch} {engineering_branch} {skills_str} {skills_str} {interests_text}"
        user_tokens = self._tokenize(user_query_text)
        user_vec = self._vectorize_tokens(user_tokens)

        scored_courses = []

        for idx, course in enumerate(self.courses):
            course_vec = self.course_vectors[idx]
            
            # 1. Real-time Cosine Similarity (TF-IDF Vector Space)
            cos_sim = self._cosine_similarity(user_vec, course_vec)

            # 2. Direct Skill Overlap
            skill_score, matched_skills = self._calculate_skill_overlap(selected_skills, course.get("skills", []))

            # 3. Knowledge-based Level Compatibility
            level_score = self._level_affinity(experience_level, course.get("level", "Beginner"))

            # 4. Domain & Engineering Branch Alignment
            branch_boost = 0.0
            if engineering_branch:
                branch_tokens = self._tokenize(engineering_branch)
                course_domain_lower = course.get("domain", "").lower()
                if any(bt in course_domain_lower for bt in branch_tokens if len(bt) > 3):
                    branch_boost = 0.08

            # 5. Composite Cold-Start Recommendation Score
            final_score = (0.45 * cos_sim) + (0.35 * skill_score) + (0.12 * level_score) + branch_boost

            # Generate natural explainable AI justification
            reasons = []
            if matched_skills:
                reasons.append(f"teaches your target skills: {', '.join(matched_skills[:3])}")
            if target_role and any(t in course['domain'].lower() or t in course['title'].lower() for t in self._tokenize(target_role)):
                reasons.append(f"aligns with your goal of {target_role}")
            elif engineering_branch and any(bt in course.get("domain", "").lower() for bt in self._tokenize(engineering_branch) if len(bt) > 3):
                reasons.append(f"curated for {engineering_branch} engineering specialization")
            if not reasons:
                reasons.append(f"strong foundation for {experience_level} learners in {course['domain']}")

            explanation = f"Recommended because this course {', '.join(reasons)}."
            match_percentage = min(99, max(45, int(final_score * 100)))

            scored_courses.append({
                **course,
                "cosine_similarity": round(cos_sim, 4),
                "skill_overlap_score": round(skill_score, 4),
                "level_affinity": round(level_score, 4),
                "match_percentage": match_percentage,
                "matched_skills": matched_skills,
                "explanation": explanation
            })

        # Sort descending by match percentage & rating
        scored_courses.sort(key=lambda x: (x["match_percentage"], x["rating"]), reverse=True)
        return scored_courses[:top_k]
