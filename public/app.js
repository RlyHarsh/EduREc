// Multi-Disciplinary Engineering State Management
let allAvailableSkills = [];
let currentRecommendations = [];
let currentEngineeringBranch = "Computer Science & Information Technology";
let currentTargetRole = "Data Scientist";
let selectedSkills = ["Python", "Machine Learning", "SQL"];
let selectedLevel = "Beginner";
let activeDomainFilter = "All";
let activePricingFilter = "all"; // 'all', 'free', 'paid'
let activeSkillTab = "All";
let careerInsightsData = null;

// Multi-Disciplinary Engineering Presets
const BRANCH_PRESETS = {
  "Mechanical & Automotive Engineering": {
    defaultRole: "Mechanical Design & CAD Engineer",
    cat: "Mechanical",
    defaultSkills: ["CAD", "SolidWorks", "Finite Element Analysis", "ANSYS"],
    defaultInterests: "I want to master 3D CAD modeling with SolidWorks, run stress and fatigue FEA in ANSYS, and design EV battery thermal management systems."
  },
  "Biotechnology & Biomedical Engineering": {
    defaultRole: "Bioinformatics & Computational Biologist",
    cat: "Biotech",
    defaultSkills: ["Bioinformatics", "Genomics", "Sequence Alignment", "Python"],
    defaultInterests: "I want to analyze DNA & RNA genomic datasets with Biopython, study CRISPR gene editing tools, and perform molecular docking for drug targets."
  },
  "Computer Science & Information Technology": {
    defaultRole: "Data Scientist",
    cat: "CS",
    defaultSkills: ["Python", "Machine Learning", "SQL", "Pandas"],
    defaultInterests: "I want to master Python programming, analyze datasets with Pandas, and build predictive machine learning models."
  },
  "Electrical & Electronics Engineering": {
    defaultRole: "VLSI & Embedded Systems Engineer",
    cat: "Electrical",
    defaultSkills: ["VLSI", "Verilog", "Embedded Systems", "ARM Cortex"],
    defaultInterests: "I want to design digital circuits in Verilog, write bare-metal firmware on ARM Cortex-M microcontrollers, and design multi-layer PCBs with KiCad."
  },
  "Civil & Infrastructure Engineering": {
    defaultRole: "Structural Analysis & BIM Engineer",
    cat: "Civil",
    defaultSkills: ["Structural Analysis", "STAAD Pro", "ETABS", "BIM", "Autodesk Revit"],
    defaultInterests: "I want to analyze earthquake-resistant structures in ETABS, generate parametric 3D models in Revit, and manage construction schedules."
  },
  "Chemical & Materials Engineering": {
    defaultRole: "Chemical Process & Plant Design Engineer",
    cat: "Chemical",
    defaultSkills: ["Aspen Plus", "Chemical Process Simulation", "Chemical Reaction Engineering", "Materials Science"],
    defaultInterests: "I want to simulate chemical flowsheet processes in Aspen Plus, design catalytic reactors, and synthesize advanced functional nanomaterials."
  },
  "Aerospace & Aeronautical Engineering": {
    defaultRole: "Aerospace & Propulsion Engineer",
    cat: "Aerospace",
    defaultSkills: ["Aerospace Engineering", "Aerodynamics", "Rocket Propulsion", "Orbital Mechanics"],
    defaultInterests: "I want to master supersonic aerodynamics, design rocket de Laval nozzles, and compute orbital satellite transfers."
  },
  "Robotics & Mechatronics Engineering": {
    defaultRole: "Robotics & Autonomous Systems Engineer",
    cat: "Robotics",
    defaultSkills: ["Robotics", "ROS 2", "SLAM", "Robot Kinematics", "MATLAB"],
    defaultInterests: "I want to master multi-axis robot kinematics, simulate mobile robots in Gazebo with ROS 2, and deploy autonomous SLAM navigation."
  }
};

const SKILL_CATEGORY_MAP = {
  // Mechanical
  "CAD": "Mechanical", "SolidWorks": "Mechanical", "Autodesk Fusion 360": "Mechanical", "3D Modeling": "Mechanical",
  "CAM": "Mechanical", "Parametric Design": "Mechanical", "Finite Element Analysis": "Mechanical", "ANSYS": "Mechanical",
  "Stress Analysis": "Mechanical", "Structural Mechanics": "Mechanical", "Meshing": "Mechanical", "CFD": "Mechanical",
  "Fluid Mechanics": "Mechanical", "OpenFOAM": "Mechanical", "Navier-Stokes": "Mechanical", "Aerodynamics": "Mechanical",
  "Electric Vehicles": "Mechanical", "Battery Management Systems": "Mechanical", "Powertrain": "Mechanical",
  "Thermodynamics": "Mechanical", "Heat Transfer": "Mechanical", "Thermal Engineering": "Mechanical", "Power Cycles": "Mechanical",
  "Energy Systems": "Mechanical", "GD&T": "Mechanical", "Manufacturing Processes": "Mechanical", "CNC Machining": "Mechanical",
  "Quality Control": "Mechanical", "Tolerance Analysis": "Mechanical", "Mechanical Vibrations": "Mechanical",
  "Machine Dynamics": "Mechanical", "Modal Analysis": "Mechanical", "Damping": "Mechanical", "Rotordynamics": "Mechanical",

  // Biotech
  "Bioinformatics": "Biotech", "Computational Biology": "Biotech", "Sequence Alignment": "Biotech", "Genomics": "Biotech",
  "Bioprocess Engineering": "Biotech", "Fermentation": "Biotech", "Bioreactors": "Biotech", "Downstream Processing": "Biotech",
  "Cell Culture": "Biotech", "CRISPR-Cas9": "Biotech", "Genetic Engineering": "Biotech", "Molecular Biology": "Biotech",
  "Recombinant DNA": "Biotech", "Gene Editing": "Biotech", "Biomedical Devices": "Biotech", "Biosensors": "Biotech",
  "Signal Acquisition": "Biotech", "Medical Imaging": "Biotech", "Physiological Monitoring": "Biotech", "Drug Discovery": "Biotech",
  "Molecular Docking": "Biotech", "Structural Biology": "Biotech", "PyMOL": "Biotech", "AutoDock": "Biotech",
  "Pharmacology": "Biotech", "Tissue Engineering": "Biotech", "Biomaterials": "Biotech", "Regenerative Medicine": "Biotech",
  "Scaffolds": "Biotech", "Cell Differentiation": "Biotech", "Biostatistics": "Biotech", "Survival Analysis": "Biotech", "Clinical Trials": "Biotech",

  // Electrical / ECE
  "VLSI": "Electrical", "Verilog": "Electrical", "Digital Logic": "Electrical", "FPGA": "Electrical", "ASIC Design": "Electrical",
  "Synthesis": "Electrical", "Embedded Systems": "Electrical", "ARM Cortex": "Electrical", "C Programming": "Electrical",
  "RTOS": "Electrical", "Microcontrollers": "Electrical", "I2C/SPI": "Electrical", "Power Electronics": "Electrical",
  "DC-DC Converters": "Electrical", "Inverters": "Electrical", "PWM": "Electrical", "Motor Drives": "Electrical",
  "Semiconductors": "Electrical", "Power Systems": "Electrical", "Renewable Energy": "Electrical", "Smart Grid": "Electrical",
  "Solar PV": "Electrical", "Wind Power": "Electrical", "Grid Stability": "Electrical", "PCB Design": "Electrical",
  "KiCad": "Electrical", "Schematic Capture": "Electrical", "Circuit Layout": "Electrical", "Signal Integrity": "Electrical",
  "Soldering": "Electrical", "Digital Signal Processing": "Electrical", "DSP": "Electrical", "FFT": "Electrical",
  "Filtering": "Electrical", "Signal Modulation": "Electrical", "IoT": "Electrical", "ESP32": "Electrical",
  "MQTT": "Electrical", "Sensor Networks": "Electrical", "Microcontroller Interfacing": "Electrical", "Edge Computing": "Electrical",

  // Civil
  "Structural Analysis": "Civil", "STAAD Pro": "Civil", "ETABS": "Civil", "Reinforced Concrete": "Civil",
  "Earthquake Engineering": "Civil", "BIM": "Civil", "Autodesk Revit": "Civil", "3D Architecture": "Civil",
  "Clash Detection": "Civil", "Construction Documentation": "Civil", "Soil Mechanics": "Civil", "Geotechnical Engineering": "Civil",
  "Foundation Design": "Civil", "Slope Stability": "Civil", "Retaining Walls": "Civil", "Transportation Engineering": "Civil",
  "Highway Design": "Civil", "Traffic Flow": "Civil", "Pavement Design": "Civil", "GIS": "Civil", "Environmental Engineering": "Civil",
  "Wastewater Treatment": "Civil", "Water Quality": "Civil", "Filtration": "Civil", "Hydrology": "Civil",
  "Construction Management": "Civil", "Primavera P6": "Civil", "Cost Estimation": "Civil", "Project Scheduling": "Civil", "Risk Management": "Civil",

  // Chemical & Materials
  "Aspen Plus": "Chemical", "Chemical Process Simulation": "Chemical", "Process Optimization": "Chemical", "Mass & Energy Balance": "Chemical",
  "Chemical Reaction Engineering": "Chemical", "Reactor Design": "Chemical", "Catalysis": "Chemical", "Kinetics": "Chemical",
  "Materials Science": "Chemical", "Metallurgy": "Chemical", "Phase Diagrams": "Chemical", "Crystallography": "Chemical",
  "Mechanical Properties": "Chemical", "Nanotechnology": "Chemical", "Nanomaterials": "Chemical", "SEM/TEM": "Chemical",
  "Carbon Nanotubes": "Chemical", "Surface Chemistry": "Chemical", "Mass Transfer": "Chemical", "Distillation": "Chemical",
  "Separation Processes": "Chemical", "Absorption": "Chemical",

  // Aerospace
  "Aerospace Engineering": "Aerospace", "Orbital Mechanics": "Aerospace", "Flight Dynamics": "Aerospace", "Avionics": "Aerospace",
  "Rocket Propulsion": "Aerospace", "Propulsion": "Aerospace", "Nozzle Design": "Aerospace", "Thrust": "Aerospace",
  "Spacecraft Dynamics": "Aerospace", "Aircraft Structures": "Aerospace", "Composites": "Aerospace", "Aeroelasticity": "Aerospace", "Fatigue Analysis": "Aerospace",

  // Robotics
  "Robotics": "Robotics", "Robot Kinematics": "Robotics", "Trajectory Planning": "Robotics", "Robot Dynamics": "Robotics",
  "Motion Control": "Robotics", "ROS 2": "Robotics", "SLAM": "Robotics", "Autonomous Navigation": "Robotics", "Lidar": "Robotics",
  "Gazebo": "Robotics", "Mechatronics": "Robotics", "Feedback Control": "Robotics", "PID Controllers": "Robotics", "Actuators": "Robotics", "Sensors": "Robotics", "Simulink": "Robotics"
};

function getSkillCategory(skill) {
  return SKILL_CATEGORY_MAP[skill] || "CS";
}

// DOM Elements
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const onboardingForm = document.getElementById("onboarding-form");
const engineeringBranchSelect = document.getElementById("engineering-branch");
const targetRoleSelect = document.getElementById("target-role");
const interestsTextArea = document.getElementById("interests-text");
const skillsFilterTabs = document.getElementById("skills-filter-tabs");
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

// AI Threat & Future Demand Elements
const metricDemandGrowth = document.getElementById("metric-demand-growth");
const metricMarketSupply = document.getElementById("metric-market-supply");
const metricAiCard = document.getElementById("metric-ai-card");
const metricAiThreatVal = document.getElementById("metric-ai-threat-val");
const metricAiThreatSub = document.getElementById("metric-ai-threat-sub");
const btnToggleAiThreat = document.getElementById("btn-toggle-ai-threat");
const aiThreatDrawer = document.getElementById("ai-threat-drawer");
const aiDrawerRoleText = document.getElementById("ai-drawer-role-text");
const aiScoreCircle = document.getElementById("ai-score-circle");
const humanMoatContainer = document.getElementById("human-moat-container");
const intelGrowthRate = document.getElementById("intel-growth-rate");
const intelDemandStatus = document.getElementById("intel-demand-status");
const intelSupplyStatus = document.getElementById("intel-supply-status");
const intelShortageIndex = document.getElementById("intel-shortage-index");
const intelMarketSummary = document.getElementById("intel-market-summary");
const intelAiAutomates = document.getElementById("intel-ai-automates");
const intelAiCopilot = document.getElementById("intel-ai-copilot");

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
    allAvailableSkills = data.skills || [];
    renderSkillsCloud();
  } catch (err) {
    console.error("Failed to fetch skills:", err);
  }
}

// 2. Render clickable skills cloud with discipline filtering
function renderSkillsCloud() {
  if (!skillsCloud) return;
  skillsCloud.innerHTML = "";

  const filteredSkills = allAvailableSkills.filter(skill => {
    if (activeSkillTab === "All") return true;
    return getSkillCategory(skill) === activeSkillTab;
  });

  filteredSkills.forEach(skill => {
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
  // Engineering Discipline / Branch Selector Changed
  if (engineeringBranchSelect) {
    engineeringBranchSelect.addEventListener("change", () => {
      const branch = engineeringBranchSelect.value;
      currentEngineeringBranch = branch;
      const preset = BRANCH_PRESETS[branch];
      if (preset) {
        if (targetRoleSelect) targetRoleSelect.value = preset.defaultRole;
        currentTargetRole = preset.defaultRole;
        if (interestsTextArea) interestsTextArea.value = preset.defaultInterests;
        selectedSkills = [...preset.defaultSkills];

        // Switch active skill tab
        activeSkillTab = preset.cat;
        if (skillsFilterTabs) {
          const pills = skillsFilterTabs.querySelectorAll(".skill-filter-pill");
          pills.forEach(p => {
            if (p.dataset.cat === preset.cat) {
              p.classList.add("active");
            } else {
              p.classList.remove("active");
            }
          });
        }
        renderSkillsCloud();
      }
    });
  }

  // Target Role Changed
  if (targetRoleSelect) {
    targetRoleSelect.addEventListener("change", () => {
      currentTargetRole = targetRoleSelect.value;
    });
  }

  // Skills Category Filter Tabs
  if (skillsFilterTabs) {
    const filterPills = skillsFilterTabs.querySelectorAll(".skill-filter-pill");
    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        activeSkillTab = pill.dataset.cat;
        renderSkillsCloud();
      });
    });
  }

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
    const branch = engineeringBranchSelect ? engineeringBranchSelect.value : currentEngineeringBranch;
    const targetRole = targetRoleSelect ? targetRoleSelect.value : currentTargetRole;
    const interestsText = interestsTextArea ? interestsTextArea.value.trim() : "";

    currentEngineeringBranch = branch;
    currentTargetRole = targetRole;

    // Show loading indicator
    const submitBtn = document.getElementById("btn-submit-login");
    submitBtn.innerHTML = `<span>Calculating Multi-Disciplinary Recommendations & Market Data...</span>`;
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          engineering_branch: branch,
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
        const branchShort = branch.split(" ")[0];
        displayTargetRole.textContent = `${targetRole} • ${branchShort}`;

        const profileDisplayName = document.getElementById("profile-display-name");
        const profileDisplayEmail = document.getElementById("profile-display-email");
        const profileDisplayBranch = document.getElementById("profile-display-branch");
        const profileDisplayRole = document.getElementById("profile-display-role");
        const profileDisplayLevel = document.getElementById("profile-display-level");
        const profileAvatarLarge = document.getElementById("profile-avatar-large");
        const profileSkillsTags = document.getElementById("profile-skills-tags");

        if (profileDisplayName) profileDisplayName.textContent = name;
        if (profileDisplayEmail) profileDisplayEmail.textContent = email;
        if (profileDisplayBranch) profileDisplayBranch.textContent = branch;
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
    btnToggleReadiness.querySelector("span").textContent = isHidden ? "Hide Milestones" : "Milestones";
  });

  // Toggle AI Threat & Future Demand Drawer
  if (btnToggleAiThreat) {
    btnToggleAiThreat.addEventListener("click", () => {
      const isHidden = aiThreatDrawer.style.display === "none";
      aiThreatDrawer.style.display = isHidden ? "block" : "none";
      btnToggleAiThreat.querySelector("span").textContent = isHidden ? "Hide AI Intel" : "AI Threat Intel";
    });
  }

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

    // Populate AI Threat & Future Demand Intelligence
    if (careerInsightsData && careerInsightsData.ai_security_and_market) {
      const aiData = careerInsightsData.ai_security_and_market;
      if (metricDemandGrowth) metricDemandGrowth.textContent = aiData.growth_rate_5yr;
      if (metricMarketSupply) metricMarketSupply.textContent = `${aiData.demand_level} • ${aiData.supply_level}`;
      if (metricAiThreatVal) metricAiThreatVal.textContent = `${aiData.ai_security_score}% AI-Secure`;
      if (metricAiThreatSub) metricAiThreatSub.textContent = `${aiData.ai_threat_level} • ${aiData.automation_risk_percent}% Risk`;

      const isModerate = aiData.threat_badge_class === "badge-moderate";
      if (metricAiCard) metricAiCard.classList.toggle("moderate", isModerate);
      if (aiScoreCircle) {
        aiScoreCircle.textContent = `${aiData.ai_security_score}%`;
        aiScoreCircle.classList.toggle("moderate", isModerate);
      }
      if (aiDrawerRoleText) aiDrawerRoleText.textContent = role;
      if (humanMoatContainer && aiData.human_moat) {
        humanMoatContainer.innerHTML = aiData.human_moat.map(m => `<li>${escapeHTML(m)}</li>`).join("");
      }
      if (intelGrowthRate) intelGrowthRate.textContent = aiData.growth_rate_5yr;
      if (intelDemandStatus) intelDemandStatus.textContent = aiData.demand_level;
      if (intelSupplyStatus) intelSupplyStatus.textContent = aiData.supply_level;
      if (intelShortageIndex) intelShortageIndex.textContent = aiData.talent_shortage_index;
      if (intelMarketSummary) intelMarketSummary.textContent = aiData.market_summary;
      if (intelAiAutomates) intelAiAutomates.textContent = aiData.what_ai_automates;
      if (intelAiCopilot) intelAiCopilot.textContent = aiData.ai_copilot_advantage;
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

  // Update dynamic summary stats if elements exist
  const freeStatVal = document.querySelector(".c-stat-box:nth-child(1) .c-stat-val");
  const freeStatSub = document.querySelector(".c-stat-box:nth-child(1) .c-stat-sub");
  const paidStatVal = document.querySelector(".c-stat-box:nth-child(2) .c-stat-val");
  const paidStatSub = document.querySelector(".c-stat-box:nth-child(2) .c-stat-sub");

  if (freeCourses.length > 0 && freeStatVal) {
    const avgFree = (freeCourses.reduce((acc, c) => acc + (c.rating || 0), 0) / freeCourses.length).toFixed(2);
    freeStatVal.textContent = `★ ${avgFree} Avg Rating`;
    freeStatSub.textContent = `${freeCourses.length} Courses Available`;
  }
  if (paidCourses.length > 0 && paidStatVal) {
    const avgPaid = (paidCourses.reduce((acc, c) => acc + (c.rating || 0), 0) / paidCourses.length).toFixed(2);
    paidStatVal.textContent = `★ ${avgPaid} Avg Rating`;
    paidStatSub.textContent = `${paidCourses.length} Courses Available`;
  }

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
    let matchesDomain = (activeDomainFilter === "All");
    if (!matchesDomain) {
      if (activeDomainFilter === "Computer Science & Information Technology") {
        matchesDomain = course.category === "Computer Science & IT" || [
          "AI & Machine Learning", "Data Science & Analytics", "Computer Science & Programming", 
          "Web & Full Stack Engineering", "Cloud & DevOps", "Cybersecurity", "Mobile App Development"
        ].includes(course.domain);
      } else {
        const activePrefix = activeDomainFilter.toLowerCase().split(" ")[0];
        matchesDomain = course.domain === activeDomainFilter || course.domain.toLowerCase().includes(activePrefix);
      }
    }
    
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
