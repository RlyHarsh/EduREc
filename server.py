import http.server
import socketserver
import json
import os
import urllib.parse
from recommender import ColdStartCourseRecommender

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", 8080))
MAX_PAYLOAD_SIZE = 100 * 1024  # 100 KB limit to prevent DoS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "courses.json")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

recommender = ColdStartCourseRecommender(DATA_FILE)

ROADMAPS_FILE = os.path.join(BASE_DIR, "data", "roadmaps.json")
with open(ROADMAPS_FILE, "r", encoding="utf-8") as f:
    roadmaps_data = json.load(f)

INSIGHTS_FILE = os.path.join(BASE_DIR, "data", "career_insights.json")
with open(INSIGHTS_FILE, "r", encoding="utf-8") as f:
    insights_data = json.load(f)

class RecommenderHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def _send_json_response(self, data, status=200):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/skills":
            self._send_json_response({"skills": recommender.all_skills})
            return

        elif path == "/api/career-insights":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            role = query_params.get("role", ["Data Scientist"])[0]
            role_insights = insights_data.get(role)
            if not role_insights:
                for k, v in insights_data.items():
                    if k.lower() == role.lower():
                        role_insights = v
                        break
            if not role_insights:
                role_insights = insights_data.get("Data Scientist", {})
            self._send_json_response(role_insights)
            return

        elif path == "/api/roadmap":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            role = query_params.get("role", ["Data Scientist"])[0]
            roadmap = roadmaps_data.get(role)
            if not roadmap:
                for k, v in roadmaps_data.items():
                    if k.lower() == role.lower():
                        roadmap = v
                        break
            if not roadmap:
                roadmap = roadmaps_data.get("Data Scientist", {})

            courses_by_id = {c["id"]: c for c in recommender.courses}
            enriched_stages = []
            for stage in roadmap.get("stages", []):
                stage_courses = [courses_by_id[cid] for cid in stage.get("recommended_course_ids", []) if cid in courses_by_id]
                enriched_stages.append({
                    **stage,
                    "courses": stage_courses
                })

            self._send_json_response({
                "role": role,
                "title": roadmap.get("title", ""),
                "description": roadmap.get("description", ""),
                "stages": enriched_stages
            })
            return
            
        elif path == "/api/courses":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            search = query_params.get("search", [""])[0].lower()
            if search:
                filtered = [
                    c for c in recommender.courses
                    if search in c["title"].lower() 
                    or search in c["description"].lower() 
                    or any(search in s.lower() for s in c.get("skills", []))
                ]
                self._send_json_response({"courses": filtered})
            else:
                self._send_json_response({"courses": recommender.courses})
            return

        # Serve static files from /public
        return super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == "/api/recommend":
            try:
                content_length_header = self.headers.get("Content-Length")
                if not content_length_header:
                    self._send_json_response({"error": "Missing Content-Length header"}, status=411)
                    return
                content_length = int(content_length_header)
            except (ValueError, TypeError):
                self._send_json_response({"error": "Invalid Content-Length header"}, status=400)
                return

            if content_length > MAX_PAYLOAD_SIZE:
                self._send_json_response({"error": f"Payload too large. Max allowed is {MAX_PAYLOAD_SIZE // 1024} KB"}, status=413)
                return

            try:
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)
            except Exception:
                self._send_json_response({"error": "Invalid JSON or payload encoding"}, status=400)
                return

            engineering_branch = str(payload.get("engineering_branch", "Computer Science & IT"))[:100]
            target_role = str(payload.get("target_role", ""))[:100]
            experience_level = str(payload.get("experience_level", "Beginner"))[:50]
            selected_skills = [str(s)[:50] for s in payload.get("selected_skills", [])][:50]
            interests_text = str(payload.get("interests_text", ""))[:2000]
            
            # Run real-time Cold-Start Recommender
            try:
                recommendations = recommender.recommend(
                    target_role=target_role,
                    experience_level=experience_level,
                    selected_skills=selected_skills,
                    interests_text=interests_text,
                    engineering_branch=engineering_branch,
                    top_k=15
                )
            except Exception as e:
                self._send_json_response({"error": "Recommendation engine error"}, status=500)
                return

            self._send_json_response({
                "status": "success",
                "user": {
                    "name": str(payload.get("name", "Student"))[:100],
                    "email": str(payload.get("email", ""))[:100],
                    "engineering_branch": engineering_branch,
                    "target_role": target_role,
                    "experience_level": experience_level,
                    "selected_skills": selected_skills,
                    "interests_text": interests_text
                },
                "total_recommendations": len(recommendations),
                "recommendations": recommendations
            })
            return

        self.send_error(404, "Endpoint not found")

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), RecommenderHTTPHandler) as httpd:
        print(f"Course Recommender Server running at http://{HOST}:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    run_server()
