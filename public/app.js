// State Management
let currentRecommendations = [];
let currentTargetRole = "Data Scientist";
let selectedSkills = ["Python", "Machine Learning", "SQL"];
let selectedLevel = "Beginner";
let activeDomainFilter = "All";
let activePricingFilter = "all"; // 'all', 'free', 'paid'
let careerInsightsData = null;

// DOM Elements
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const onboardingForm = document.getElementById("onboarding-form");
const skillsCloud = document.getElementById("skills-cloud");
const coursesContainer = document.getElementById("courses-container");
const liveSearchInput = document.getElementById("live-search-input");
const domainFilters = document.getElementById("domain-filters");
const pricingFilterGroup = document.getElementById("pricing-filter-group");
const resultsCountText = document.getElementById("results-count-text");
const btnEditProfile = document.getElementById("btn-edit-profile");

// Header & Profile Elements
const displayUserName = document.getElementById("display-user-name");
const displayTargetRole = document.getElementById("display-target-role");
const avatarInitials = document.getElementById("avatar-initials");

// Career Metrics Elements
const metricSalaryRange = document.getElementById("metric-salary-range");
const metricSalaryAvg = document.getElementById("metric-salary-avg");
const metricTimeMonths = document.getElementById("metric-time-months");
const metricTimeHours = document.getElementById("metric-time-hours");
const metricJobStatus = document.getElementById("metric-job-status");
const btnToggleReadiness = document.getElementById("btn-toggle-readiness");
const readinessDrawer = document.getElementById("readiness-drawer");
const readinessRoleText = document.getElementById("readiness-role-text");
const readinessMilestonesContainer = document.getElementById("readiness-milestones-container");

// Dashboard Tabs & Panels
const tabRecsBtn = document.getElementById("tab-recs-btn");
const tabRoadmapBtn = document.getElementById("tab-roadmap-btn");
const tabComparisonBtn = document.getElementById("tab-comparison-btn");
const panelRecs = document.getElementById("panel-recs");
const panelRoadmap = document.getElementById("panel-roadmap");
const panelComparison = document.getElementById("panel-comparison");
const roadmapTitle = document.getElementById("roadmap-title");
const roadmapDesc = document.getElementById("roadmap-desc");
const roadmapTreeContainer = document.getElementById("roadmap-tree-container");

const freeCoursesCompareList = document.getElementById("free-courses-compare-list");
const paidCoursesCompareList = document.getElementById("paid-courses-compare-list");

// Utility function to sanitize text and prevent DOM XSS
function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchSkills();
  setupEventListeners();
});

// 1. Fetch skills from backend API
async function fetchSkills() {
  try {
    const res = await fetch("/api/skills");
    const data = await res.json();
    renderSkillsCloud(data.skills);
  } catch (err) {
    console.error("Failed to fetch skills:", err);
  }
}

// 2. Render clickable skills cloud
function renderSkillsCloud(skills) {
  skillsCloud.innerHTML = "";
  skills.forEach(skill => {
    const tag = document.createElement("div");
    tag.className = "skill-tag" + (selectedSkills.includes(skill) ? " selected" : "");
    tag.textContent = skill;
    tag.addEventListener("click", () => {
      if (selectedSkills.includes(skill)) {
        selectedSkills = selectedSkills.filter(s => s !== skill);
        tag.classList.remove("selected");
      } else {
        selectedSkills.push(skill);
        tag.classList.add("selected");
      }
    });
    skillsCloud.appendChild(tag);
  });
}

// 3. Setup Event Listeners
function setupEventListeners() {
  // Experience level pills
  const levelButtons = document.querySelectorAll("#experience-levels .pill-btn");
  levelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      levelButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedLevel = btn.dataset.level;
    });
  });

  // Onboarding Login Form Submission
  onboardingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("student-name").value.trim() || "Student";
    const email = document.getElementById("student-email").value.trim();
    const targetRole = document.getElementById("target-role").value;
    const interestsText = document.getElementById("interests-text").value.trim();

    currentTargetRole = targetRole;

    // Show loading indicator
    const submitBtn = document.getElementById("btn-submit-login");
    submitBtn.innerHTML = `<span>Calculating Recommendations & Market Data...</span>`;
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          target_role: targetRole,
          experience_level: selectedLevel,
          selected_skills: selectedSkills,
          interests_text: interestsText
        })
      });

      const result = await response.json();
      if (result.status === "success") {
        currentRecommendations = result.recommendations;
        
        // Update user presentation
        displayUserName.textContent = name;
        displayTargetRole.textContent = targetRole;

        const profileDisplayName = document.getElementById("profile-display-name");
        const profileDisplayEmail = document.getElementById("profile-display-email");
        const profileDisplayRole = document.getElementById("profile-display-role");
        const profileDisplayLevel = document.getElementById("profile-display-level");
        const profileAvatarLarge = document.getElementById("profile-avatar-large");
        const profileSkillsTags = document.getElementById("profile-skills-tags");

        if (profileDisplayName) profileDisplayName.textContent = name;
        if (profileDisplayEmail) profileDisplayEmail.textContent = email;
        if (profileDisplayRole) profileDisplayRole.textContent = targetRole;
        if (profileDisplayLevel) profileDisplayLevel.textContent = selectedLevel;

        // Initials
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "ST";
        avatarInitials.textContent = initials;
        if (profileAvatarLarge) profileAvatarLarge.textContent = initials;

        // Populate skills tags in profile card
        if (profileSkillsTags) {
          profileSkillsTags.innerHTML = selectedSkills.map(s => `<span class="user-skill-pill">${escapeHTML(s)}</span>`).join("");
        }

        // Switch View & scroll to top immediately
        loginView.classList.remove("active");
        dashboardView.classList.add("active");
        window.scrollTo({ top: 0, behavior: "instant" });

        // Default to Recommended Courses tab
        activateTab("recs");

        // Render Recommendations Cards
        renderCourseCards(currentRecommendations);

        // Fetch Career Insights (Salary LPA, Time to Master, Milestones)
        fetchCareerInsights(targetRole);

        // Preload Roadmap Data
        fetchAndRenderRoadmap(targetRole);
      }
    } catch (err) {
      alert("Error generating recommendations: " + err.message);
    } finally {
      submitBtn.innerHTML = `<span>Sign In & Generate Recommendations</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      submitBtn.disabled = false;
    }
  });

  // Tab Switching
  tabRecsBtn.addEventListener("click", () => activateTab("recs"));
  tabRoadmapBtn.addEventListener("click", () => {
    activateTab("roadmap");
    fetchAndRenderRoadmap(currentTargetRole);
  });
  tabComparisonBtn.addEventListener("click", () => {
    activateTab("comparison");
    renderComparisonMatrix();
  });

  // Toggle 0 to Job-Ready Milestones Drawer
  btnToggleReadiness.addEventListener("click", () => {
    const isHidden = readinessDrawer.style.display === "none";
    readinessDrawer.style.display = isHidden ? "block" : "none";
    btnToggleReadiness.querySelector("span").textContent = isHidden ? "Hide Milestones" : "View Milestones";
  });

  // Back to Login / Change Goals
  btnEditProfile.addEventListener("click", () => {
    dashboardView.classList.remove("active");
    loginView.classList.add("active");
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  // Live Search Input Filter
  liveSearchInput.addEventListener("input", () => {
    filterAndRenderCourses();
  });

  // Domain Filter Buttons
  const domainBtns = domainFilters.querySelectorAll(".filter-btn");
  domainBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      domainBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeDomainFilter = btn.dataset.domain;
      filterAndRenderCourses();
    });
  });

  // Pricing Filter Pills
  const pricingPills = pricingFilterGroup.querySelectorAll(".pricing-pill");
  pricingPills.forEach(pill => {
    pill.addEventListener("click", () => {
      pricingPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activePricingFilter = pill.dataset.pricing;
      filterAndRenderCourses();
    });
  });
}

function activateTab(tab) {
  tabRecsBtn.classList.remove("active");
  tabRoadmapBtn.classList.remove("active");
  tabComparisonBtn.classList.remove("active");
  panelRecs.classList.remove("active");
  panelRoadmap.classList.remove("active");
  panelComparison.classList.remove("active");

  if (tab === "recs") {
    tabRecsBtn.classList.add("active");
    panelRecs.classList.add("active");
  } else if (tab === "roadmap") {
    tabRoadmapBtn.classList.add("active");
    panelRoadmap.classList.add("active");
  } else if (tab === "comparison") {
    tabComparisonBtn.classList.add("active");
    panelComparison.classList.add("active");
  }
}

// 4. Fetch Career Insights (Salary LPA, Time to Master, Milestones)
async function fetchCareerInsights(role) {
  try {
    const res = await fetch(`/api/career-insights?role=${encodeURIComponent(role)}`);
    careerInsightsData = await res.json();

    if (careerInsightsData && careerInsightsData.salary_lpa) {
      const entryMin = careerInsightsData.salary_lpa.entry.split("-")[0].trim();
      const seniorMax = careerInsightsData.salary_lpa.senior.includes("-") 
        ? careerInsightsData.salary_lpa.senior.split("-")[1].trim() 
        : careerInsightsData.salary_lpa.senior.trim();
      metricSalaryRange.textContent = `${entryMin} - ${seniorMax}`;
      metricSalaryAvg.textContent = `Avg: ${careerInsightsData.salary_lpa.average} • Mid: ${careerInsightsData.salary_lpa.mid}`;
      metricTimeMonths.textContent = careerInsightsData.time_to_master.duration_months;
      metricTimeHours.textContent = `${careerInsightsData.time_to_master.weekly_commitment} • ${careerInsightsData.time_to_master.total_hours}`;
      metricJobStatus.textContent = careerInsightsData.job_readiness.level;

      if (readinessRoleText) readinessRoleText.textContent = role;
      renderMilestones(careerInsightsData.job_readiness.stages || []);
    }
  } catch (err) {
    console.error("Failed to load career insights:", err);
  }
}

function renderMilestones(stages) {
  readinessMilestonesContainer.innerHTML = "";
  stages.forEach(stage => {
    const box = document.createElement("div");
    box.className = "milestone-box";
    box.innerHTML = `
      <span class="milestone-badge">${escapeHTML(stage.status)}</span>
      <h4 class="milestone-title">${escapeHTML(stage.milestone)}</h4>
      <p class="milestone-desc">${escapeHTML(stage.description)}</p>
      <div class="milestone-project">
        <strong>Hands-On Milestone:</strong> ${escapeHTML(stage.actionable_project)}
      </div>
    `;
    readinessMilestonesContainer.appendChild(box);
  });
}

// 5. Render Comparison Matrix (Free vs. Paid)
function renderComparisonMatrix() {
  const freeCourses = currentRecommendations.filter(c => c.is_free || c.has_free_audit);
  const paidCourses = currentRecommendations.filter(c => !c.is_free || (c.pricing_type && c.pricing_type.toLowerCase().includes("paid")));

  freeCoursesCompareList.innerHTML = freeCourses.slice(0, 4).map(c => `
    <div class="compare-course-item">
      <div class="compare-course-title">${escapeHTML(c.title)}</div>
      <div class="compare-course-meta">
        <span>${escapeHTML(c.institution)} • ★ ${c.rating} (${c.reviews_count} reviews)</span>
        <span style="font-weight: 700; color: var(--light-blue-accent);">${escapeHTML(c.price_tag)}</span>
      </div>
    </div>
  `).join("");

  paidCoursesCompareList.innerHTML = paidCourses.slice(0, 4).map(c => `
    <div class="compare-course-item">
      <div class="compare-course-title">${escapeHTML(c.title)}</div>
      <div class="compare-course-meta">
        <span>${escapeHTML(c.institution)} • ★ ${c.rating} (${c.reviews_count} reviews)</span>
        <span style="font-weight: 700; color: var(--black);">${escapeHTML(c.price_tag)}</span>
      </div>
    </div>
  `).join("");
}

// 6. Fetch & Render Career Roadmap
async function fetchAndRenderRoadmap(role) {
  try {
    const res = await fetch(`/api/roadmap?role=${encodeURIComponent(role)}`);
    const data = await res.json();

    if (roadmapTitle) roadmapTitle.textContent = data.title || `${role} Roadmap`;
    if (roadmapDesc) roadmapDesc.textContent = data.description || "Structured step-by-step career path.";

    renderRoadmapTree(data.stages || []);
  } catch (err) {
    console.error("Failed to load roadmap:", err);
  }
}

function renderRoadmapTree(stages) {
  roadmapTreeContainer.innerHTML = "";

  if (!stages || stages.length === 0) {
    roadmapTreeContainer.innerHTML = "<p>No roadmap found for this role.</p>";
    return;
  }

  stages.forEach(stage => {
    const node = document.createElement("div");
    node.className = "roadmap-stage-node";

    // Topics list
    const topicsHtml = stage.topics.map(t => `<span class="roadmap-topic-chip">${escapeHTML(t)}</span>`).join("");

    // Recommended courses inside this node
    let coursesHtml = "";
    if (stage.courses && stage.courses.length > 0) {
      coursesHtml = stage.courses.map(course => `
        <div class="roadmap-course-box">
          <div class="course-box-label">Recommended for this Milestone:</div>
          <div class="course-box-title">${escapeHTML(course.title)}</div>
          <div class="course-box-meta">
            <span>${escapeHTML(course.institution)} • ★ ${course.rating} • ${escapeHTML(course.price_tag || 'Free to Audit')}</span>
            <a href="${encodeURI(course.url)}" target="_blank" rel="noopener noreferrer" class="card-link">
              <span>View Course</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
      `).join("");
    }

    node.innerHTML = `
      <div class="roadmap-step-circle">${escapeHTML(stage.step)}</div>
      <div class="roadmap-node-card">
        <div class="stage-top-meta">
          <span class="stage-phase-tag">${escapeHTML(stage.phase)}</span>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--gray-muted);">Step ${escapeHTML(stage.step)} of ${stages.length}</span>
        </div>
        <h3 class="stage-title">${escapeHTML(stage.title)}</h3>
        <p class="stage-desc">${escapeHTML(stage.description)}</p>
        <div class="stage-topics-list">
          ${topicsHtml}
        </div>
        ${coursesHtml}
      </div>
    `;

    roadmapTreeContainer.appendChild(node);
  });
}

// 7. Filter and Render Courses
function filterAndRenderCourses() {
  const query = liveSearchInput.value.toLowerCase().trim();

  const filtered = currentRecommendations.filter(course => {
    // Domain match
    const matchesDomain = (activeDomainFilter === "All") || (course.domain === activeDomainFilter);
    
    // Pricing match
    let matchesPricing = true;
    if (activePricingFilter === "free") {
      matchesPricing = course.is_free || course.has_free_audit;
    } else if (activePricingFilter === "paid") {
      matchesPricing = !course.is_free || (course.pricing_type && course.pricing_type.toLowerCase().includes("paid"));
    }

    // Text query match
    const matchesQuery = !query || 
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.institution.toLowerCase().includes(query) ||
      course.skills.some(s => s.toLowerCase().includes(query));

    return matchesDomain && matchesPricing && matchesQuery;
  });

  renderCourseCards(filtered);
}

// 8. Render Course Cards
function renderCourseCards(courses) {
  coursesContainer.innerHTML = "";
  resultsCountText.textContent = `Showing ${courses.length} recommended course${courses.length === 1 ? '' : 's'}`;

  if (courses.length === 0) {
    coursesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px solid var(--gray-border);">
        <h3 style="font-size: 1.15rem; color: var(--black); margin-bottom: 8px;">No courses match your filter criteria</h3>
        <p style="font-size: 0.88rem; color: var(--gray-muted);">Try switching between Free and Paid filters or adjusting your search query.</p>
      </div>
    `;
    return;
  }

  courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";

    // Skills pills HTML (highlighting user's matched skills)
    const skillsHtml = course.skills.slice(0, 5).map(skill => {
      const isMatched = course.matched_skills && course.matched_skills.some(ms => ms.toLowerCase() === skill.toLowerCase());
      return `<span class="course-skill-tag ${isMatched ? 'highlighted' : ''}">${escapeHTML(skill)}</span>`;
    }).join("");

    const pricingBadgeText = course.price_tag || (course.is_free ? "Free to Audit" : "Paid Certificate");

    card.innerHTML = `
      <div class="card-top">
        <span class="institution-pill">${escapeHTML(course.institution)}</span>
        <span class="match-badge">${course.match_percentage}% Match</span>
      </div>

      <h3 class="course-title">${escapeHTML(course.title)}</h3>
      <p class="course-desc">${escapeHTML(course.description)}</p>

      <div class="card-skills">
        ${skillsHtml}
      </div>

      <div class="card-explanation">
        <strong>Recommendation Rationale:</strong> ${escapeHTML(course.explanation)}
      </div>

      <div style="margin-bottom: 14px;">
        <span class="course-pricing-badge">${escapeHTML(pricingBadgeText)}</span>
      </div>

      <div class="card-footer">
        <div>
          <span class="rating-item">★ ${course.rating}</span>
          <span>(${course.reviews_count})</span>
          <span>• ${escapeHTML(course.level)}</span>
        </div>
        <a href="${encodeURI(course.url)}" target="_blank" rel="noopener noreferrer" class="card-link">
          <span>View Course</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    `;

    coursesContainer.appendChild(card);
  });
}
