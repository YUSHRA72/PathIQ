// ======================================================
// PATHIQ - MAIN JAVASCRIPT
// ======================================================

const API = "http://localhost:8080";


// ======================================================
// COMMON HELPERS
// ======================================================

function getStoredUser() {

    const storedUser =
        localStorage.getItem("pathiqUser");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        return null;
    }
}


function logout() {

    localStorage.removeItem("pathiqUser");

    window.location.href = "login.html";
}


// Logout buttons
document
    .querySelectorAll(".dashboard-logout")
    .forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                logout();

            }
        );

    });


// ======================================================
// REGISTER
// ======================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("name")?.value.trim();

            const email =
                document.getElementById("email")?.value.trim();

            const password =
                document.getElementById("password")?.value;

            const education =
                document.getElementById("education")?.value;

            const semester =
                document.getElementById("semester")?.value;

            const learningHours =
                document.getElementById("learningHours")?.value;

            const careerId =
                document.getElementById("careerId")?.value;


            try {

                const response =
                    await fetch(
                        `${API}/api/users`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                password: password,

                                education:
                                    education || null,

                                semester:
                                    semester
                                        ? Number(semester)
                                        : null,

                                learningHours:
                                    learningHours
                                        ? Number(learningHours)
                                        : null,

                                careerId:
                                    careerId
                                        ? Number(careerId)
                                        : null

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;
                }


                alert(
                    "Registration successful! ♡"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Could not connect to the server."
                );

            }

        }
    );

}


// ======================================================
// LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
    document.getElementById("loginEmail")?.value.trim();

const password =
    document.getElementById("loginPassword")?.value;


            try {

                const response =
                    await fetch(
                        `${API}/api/users/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid email or password."
                    );

                    return;
                }


                localStorage.setItem(
                    "pathiqUser",
                    JSON.stringify(data)
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Could not connect to the server."
                );

            }

        }
    );

}


// ======================================================
// DASHBOARD
// ======================================================

const dashboard =
    document.querySelector(".dashboard");

if (dashboard) {

    loadDashboardData();

}


async function loadDashboardData() {

    const user =
        getStoredUser();

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        // ------------------------------------------
        // USER
        // ------------------------------------------

        const userResponse =
            await fetch(
                `${API}/api/users/${user.userId}`
            );


        if (!userResponse.ok) {
            throw new Error(
                "Could not load user"
            );
        }


        const userData =
            await userResponse.json();


        const userName =
            document.getElementById("userName");

        if (userName) {

            userName.textContent =
                userData.name || "there";

        }


        const careerGoal =
            document.getElementById("careerGoal");

        const careerId =
            userData.career?.careerId;

        const careerName =
            userData.career?.careerName ||
            "Not selected";


        if (careerGoal) {

            careerGoal.textContent =
                careerName;

        }


        // ------------------------------------------
        // ASSESSMENTS
        // ------------------------------------------

        const assessmentResponse =
            await fetch(
                `${API}/api/assessments`
            );


        const allAssessments =
            assessmentResponse.ok
                ? await assessmentResponse.json()
                : [];


        const userAssessments =
            allAssessments.filter(
                assessment =>
                    assessment.user?.userId ===
                    user.userId
            );


        // Count UNIQUE skills
        const uniqueSkills =
            new Set(
                userAssessments.map(
                    assessment =>
                        assessment.skill?.skillId
                )
            );


        const skillsAssessed =
            document.getElementById(
                "skillsAssessed"
            );


        if (skillsAssessed) {

            skillsAssessed.textContent =
                uniqueSkills.size;

        }


        // ------------------------------------------
        // SKILL GAPS
        // ------------------------------------------

        let gaps = [];


        if (careerId) {

            const gapResponse =
                await fetch(
                    `${API}/api/skill-gaps?userId=${user.userId}&careerId=${careerId}`
                );


            if (gapResponse.ok) {

                gaps =
                    await gapResponse.json();

            }

        }


        const actualGaps =
            gaps.filter(
                gap =>
                    Number(gap.gap) > 0
            );


        const skillGaps =
            document.getElementById(
                "skillGaps"
            );


        if (skillGaps) {

            skillGaps.textContent =
                actualGaps.length;

        }


        // ------------------------------------------
        // DASHBOARD SKILLS
        // ------------------------------------------

        const skillItems =
            document.querySelectorAll(
                ".skill-item[data-skill-id]"
            );


        skillItems.forEach(
            item => {

                const skillId =
                    Number(
                        item.dataset.skillId
                    );


                const matchingAssessment =
                    userAssessments.find(
                        assessment =>
                            assessment.skill?.skillId ===
                            skillId
                    );


                if (!matchingAssessment) {
                    return;
                }


                const percentage =
                    Number(
                        matchingAssessment.skillLevel
                    );


                const percentageText =
                    item.querySelector(
                        ".skill-percentage"
                    );


                const progressFill =
                    item.querySelector(
                        ".progress-fill"
                    );


                if (percentageText) {

                    percentageText.textContent =
                        `${percentage}%`;

                }


                if (progressFill) {

                    progressFill.style.width =
                        `${percentage}%`;

                }

            }
        );


        // ------------------------------------------
        // ROADMAP
        // ------------------------------------------

        const roadmapResponse =
            await fetch(
                `${API}/api/roadmaps`
            );


        const allRoadmaps =
            roadmapResponse.ok
                ? await roadmapResponse.json()
                : [];


        const userRoadmaps =
            allRoadmaps.filter(
                roadmap =>
                    roadmap.user?.userId ===
                    user.userId
            );


        const roadmapItems =
            document.getElementById(
                "roadmapItems"
            );


        if (roadmapItems) {

            roadmapItems.textContent =
                userRoadmaps.length;

        }


        // ------------------------------------------
        // PROGRESS
        // ------------------------------------------

        const progressResponse =
            await fetch(
                `${API}/api/roadmaps/progress?userId=${user.userId}`
            );


        if (progressResponse.ok) {

            const progress =
                await progressResponse.json();


            const progressElement =
                document.getElementById(
                    "progress"
                );


            if (progressElement) {

                progressElement.textContent =
                    `${Math.round(progress)}%`;

            }

        }


        // ------------------------------------------
        // SKILL GAP LIST
        // ------------------------------------------

        const skillGapList =
            document.getElementById(
                "skillGapList"
            );


        if (skillGapList) {

            if (!actualGaps.length) {

                skillGapList.innerHTML = `
                    <div class="gap-item">
                        <div>
                            <strong>
                                You're doing great ♡
                            </strong>
                            <span>
                                No major skill gaps found.
                            </span>
                        </div>
                    </div>
                `;

            } else {

                const skillsResponse =
                    await fetch(
                        `${API}/api/skills`
                    );


                const skills =
                    skillsResponse.ok
                        ? await skillsResponse.json()
                        : [];


                skillGapList.innerHTML = "";


                actualGaps.forEach(
                    gap => {

                        const skill =
                            skills.find(
                                item =>
                                    item.skillId ===
                                    gap.skillId
                            );


                        const skillName =
                            skill?.skillName ||
                            "Skill";


                        skillGapList.innerHTML += `

                            <div class="gap-item">

                                <div>

                                    <strong>
                                        ${skillName}
                                    </strong>

                                    <span>
                                        Needs improvement
                                        · Current
                                        ${gap.currentLevel}%
                                        / Target
                                        ${gap.requiredLevel}%
                                    </span>

                                </div>

                                <b>
                                    ${gap.gap}%
                                </b>

                            </div>

                        `;

                    }
                );

            }

        }


        // ------------------------------------------
        // DASHBOARD ROADMAP LIST
        // ------------------------------------------

        const roadmapList =
            document.getElementById(
                "roadmapList"
            );


        if (roadmapList) {

            if (!userRoadmaps.length) {

                roadmapList.innerHTML = `
                    <div class="roadmap-item">
                        <div class="roadmap-content">
                            <h3>
                                No roadmap yet
                            </h3>
                            <p>
                                Complete an assessment to
                                create your roadmap.
                            </p>
                        </div>
                    </div>
                `;

            } else {

                roadmapList.innerHTML = "";


                userRoadmaps
                    .slice(0, 5)
                    .forEach(
                        (roadmap, index) => {

                            const skillName =
                                roadmap.skill?.skillName ||
                                "Skill";


                            roadmapList.innerHTML += `

                                <div class="roadmap-item">

                                    <div class="roadmap-number">
                                        ${String(index + 1).padStart(2, "0")}
                                    </div>

                                    <div class="roadmap-content">

                                        <h3>
                                            Improve ${skillName}
                                        </h3>

                                        <p>
                                            ${roadmap.learningResource ||
                                            `Improve ${skillName} from ${roadmap.currentLevel}% to ${roadmap.targetLevel}%`}
                                        </p>

                                    </div>

                                    <span class="
                                        roadmap-status
                                        ${roadmap.status === "Completed"
                                            ? "completed"
                                            : roadmap.status === "In Progress"
                                                ? "in-progress"
                                                : "not-started"}
                                    ">
                                        ${roadmap.status}
                                    </span>

                                </div>

                            `;

                        }
                    );

            }

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ======================================================
// DASHBOARD NAVIGATION
// ======================================================

document
    .querySelectorAll(".small-action")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const text =
                    this.textContent
                        .toLowerCase();


                if (
                    text.includes(
                        "skill analysis"
                    )
                ) {

                    window.location.href =
                        "skill-analysis.html";

                }


                else if (
                    text.includes(
                        "roadmap"
                    )
                ) {

                    window.location.href =
                        "roadmap.html";

                }

                else if (
                    text.includes(
                        "project"
                    )
                ) {

                    window.location.href =
                        "projects.html";

                }

            }
        );

    });


// ======================================================
// ASSESSMENT
// ======================================================

const skillSelect =
    document.getElementById(
        "skillSelect"
    );


if (skillSelect) {

    let questions = [];

    let currentIndex = 0;

    let selectedAnswer = null;

    let answers = [];

    let selectedSkillId = null;


    const questionText =
        document.getElementById(
            "questionText"
        );


    const optionButtons =
        document.querySelectorAll(
            ".option"
        );


    const nextButton =
        document.getElementById(
            "nextButton"
        );


    const skillTitle =
        document.getElementById(
            "skillTitle"
        );


    const currentQuestion =
        document.getElementById(
            "currentQuestion"
        );


    const questionNumber =
        document.getElementById(
            "questionNumber"
        );


    const totalQuestions =
        document.getElementById(
            "totalQuestions"
        );


    const assessmentProgress =
        document.getElementById(
            "assessmentProgress"
        );


    // ------------------------------------------
    // LOAD CAREER SKILLS
    // ------------------------------------------

    async function loadAssessmentSkills() {

        const user =
            getStoredUser();


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            const userResponse =
                await fetch(
                    `${API}/api/users/${user.userId}`
                );


            if (!userResponse.ok) {
                throw new Error(
                    "Could not load user"
                );
            }


            const userData =
                await userResponse.json();


            const careerId =
                userData.career?.careerId;


            if (!careerId) {

                skillSelect.innerHTML = `
                    <option value="">
                        Choose a career first
                    </option>
                `;

                return;

            }


            // Get role skills
            const roleSkillsResponse =
                await fetch(
                    `${API}/api/role-skills`
                );


            if (!roleSkillsResponse.ok) {
                throw new Error(
                    "Could not load career skills"
                );
            }


            const roleSkills =
                await roleSkillsResponse.json();


            const careerSkills =
                roleSkills.filter(
                    roleSkill =>
                        Number(roleSkill.careerId) ===
                        Number(careerId)
                );


            // Get all skills
            const skillsResponse =
                await fetch(
                    `${API}/api/skills`
                );


            if (!skillsResponse.ok) {
                throw new Error(
                    "Could not load skills"
                );
            }


            const skills =
                await skillsResponse.json();


            skillSelect.innerHTML = `
                <option value="">
                    Select a skill
                </option>
            `;


            careerSkills.forEach(
                roleSkill => {

                    const skill =
                        skills.find(
                            item =>
                                Number(item.skillId) ===
                                Number(roleSkill.skillId)
                        );


                    if (!skill) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        skill.skillId;


                    option.textContent =
                        skill.skillName;


                    skillSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Assessment skills error:",
                error
            );


            skillSelect.innerHTML = `
                <option value="">
                    Could not load skills
                </option>
            `;

        }

    }


    // ------------------------------------------
    // LOAD QUESTIONS
    // ------------------------------------------

    async function loadQuestions(
        skillId
    ) {

        try {

            const response =
                await fetch(
                    `${API}/api/questions`
                );


            if (!response.ok) {
                throw new Error(
                    "Could not load questions"
                );
            }


            const allQuestions =
                await response.json();


            questions =
                allQuestions
                    .filter(
                        question =>
                            Number(question.skillId) ===
                            Number(skillId)
                    )
                    .slice(0, 5);


            if (!questions.length) {

                questionText.textContent =
                    "No questions available for this skill.";

                nextButton.disabled =
                    true;

                return;

            }


            currentIndex = 0;

            answers = [];

            selectedAnswer = null;


            showQuestion();


        } catch (error) {

            console.error(
                "Question loading error:",
                error
            );


            questionText.textContent =
                "Could not load questions.";

        }

    }


    // ------------------------------------------
    // SHOW QUESTION
    // ------------------------------------------

    function showQuestion() {

        const question =
            questions[currentIndex];


        const selectedOption =
            skillSelect.options[
                skillSelect.selectedIndex
            ];


        skillTitle.textContent =
            selectedOption.text;


        currentQuestion.textContent =
            currentIndex + 1;


        totalQuestions.textContent =
            questions.length;


        questionNumber.textContent =
            String(currentIndex + 1)
                .padStart(2, "0");


        questionText.textContent =
            question.question;


        document.getElementById(
            "optionA"
        ).textContent =
            question.optionA;


        document.getElementById(
            "optionB"
        ).textContent =
            question.optionB;


        document.getElementById(
            "optionC"
        ).textContent =
            question.optionC;


        document.getElementById(
            "optionD"
        ).textContent =
            question.optionD;


        optionButtons.forEach(
            button => {

                button.disabled =
                    false;

                button.classList.remove(
                    "selected"
                );

            }
        );


        selectedAnswer =
            null;


        nextButton.disabled =
            true;


        nextButton.innerHTML =
            currentIndex ===
            questions.length - 1
                ? `Submit assessment <span>✓</span>`
                : `Next question <span>→</span>`;


        const progress =
            ((currentIndex + 1) /
                questions.length) * 100;


        assessmentProgress.style.width =
            `${progress}%`;

    }


    // ------------------------------------------
    // SELECT SKILL
    // ------------------------------------------

    skillSelect.addEventListener(
        "change",
        async function () {

            selectedSkillId =
                this.value;


            if (!selectedSkillId) {

                skillTitle.textContent =
                    "Select a skill";


                questionText.textContent =
                    "Select a skill to begin your assessment.";


                optionButtons.forEach(
                    button => {

                        button.disabled =
                            true;

                        button.classList.remove(
                            "selected"
                        );

                    }
                );


                nextButton.disabled =
                    true;


                assessmentProgress.style.width =
                    "0%";


                return;

            }


            await loadQuestions(
                selectedSkillId
            );

        }
    );


    // ------------------------------------------
    // SELECT ANSWER
    // ------------------------------------------

    optionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    optionButtons.forEach(
                        item =>
                            item.classList.remove(
                                "selected"
                            )
                    );


                    this.classList.add(
                        "selected"
                    );


                    selectedAnswer =
                        this.dataset.answer;


                    nextButton.disabled =
                        false;

                }
            );

        }
    );


    // ------------------------------------------
    // NEXT / SUBMIT
    // ------------------------------------------

    nextButton.addEventListener(
        "click",
        async function () {

            if (!selectedAnswer) {
                return;
            }


            answers.push(
                selectedAnswer
            );


            // More questions
            if (
                currentIndex <
                questions.length - 1
            ) {

                currentIndex++;

                showQuestion();

                return;

            }


            // --------------------------------------
            // SUBMIT ASSESSMENT
            // --------------------------------------

            const user =
                getStoredUser();


            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            try {

                nextButton.disabled =
                    true;


                nextButton.innerHTML =
                    "Saving...";


                const response =
                    await fetch(
                        `${API}/api/assessments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                userId:
                                    Number(
                                        user.userId
                                    ),

                                skillId:
                                    Number(
                                        selectedSkillId
                                    ),

                                answers:
                                    answers

                            })
                        }
                    );


                if (!response.ok) {
                    throw new Error(
                        "Assessment submission failed"
                    );
                }


                // Get career
                const userResponse =
                    await fetch(
                        `${API}/api/users/${user.userId}`
                    );


                const userData =
                    await userResponse.json();


                const careerId =
                    userData.career?.careerId;


                // Generate roadmap
                if (careerId) {

                    const roadmapResponse =
                        await fetch(
                            `${API}/api/roadmaps/generate?userId=${user.userId}&careerId=${careerId}`,
                            {
                                method: "POST"
                            }
                        );


                    if (!roadmapResponse.ok) {

                        console.warn(
                            "Roadmap generation failed"
                        );

                    }

                }


                alert(
                    "Assessment completed successfully! ♡"
                );


                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Assessment submission error:",
                    error
                );


                alert(
                    "Could not save your assessment."
                );


                nextButton.disabled =
                    false;


                nextButton.innerHTML =
                    `Submit assessment <span>✓</span>`;

            }

        }
    );


    // Start
    loadAssessmentSkills();

}


// ======================================================
// SKILL ANALYSIS PAGE
// ======================================================

const analysisList =
    document.getElementById("analysisList");

if (analysisList) {

    async function loadSkillAnalysisPage() {

        const storedUser =
            localStorage.getItem("pathiqUser");

        if (!storedUser) {

            window.location.href =
                "login.html";

            return;
        }

        const user =
            JSON.parse(storedUser);

        try {

            // Get user information
            const userResponse =
                await fetch(
                    `${API}/api/users/${user.userId}`
                );

            if (!userResponse.ok) {
                throw new Error(
                    "Could not load user"
                );
            }

            const userData =
                await userResponse.json();

            const careerId =
                userData.career?.careerId;

            const careerName =
                userData.career?.careerName ||
                "Career";

            document.getElementById(
                "analysisCareer"
            ).textContent = careerName;


            if (!careerId) {

                analysisList.innerHTML = `
                    <div class="analysis-empty">

                        <h3>
                            Choose your career first ♡
                        </h3>

                        <p>
                            We need your career goal
                            to analyze your skills.
                        </p>

                    </div>
                `;

                return;
            }


            // Get skill gaps
            const gapResponse =
                await fetch(
                    `${API}/api/skill-gaps?userId=${user.userId}&careerId=${careerId}`
                );

            if (!gapResponse.ok) {
                throw new Error(
                    "Could not load skill gaps"
                );
            }

            const gaps =
                await gapResponse.json();


            // Get all skills
            const skillsResponse =
                await fetch(
                    `${API}/api/skills`
                );

            if (!skillsResponse.ok) {
                throw new Error(
                    "Could not load skills"
                );
            }

            const skills =
                await skillsResponse.json();


            const skillMap = {};

            skills.forEach(skill => {

                skillMap[skill.skillId] =
                    skill.skillName;

            });


            if (!gaps.length) {

                analysisList.innerHTML = `
                    <div class="analysis-empty">

                        <h3>
                            No skill data yet ✨
                        </h3>

                        <p>
                            Complete an assessment
                            to see your skill analysis.
                        </p>

                    </div>
                `;

                return;
            }


            const skillsWithGaps =
                gaps.filter(
                    gap => gap.gap > 0
                );


            document.getElementById(
                "analysisGapCount"
            ).textContent =
                skillsWithGaps.length;


            const biggestGap =
                Math.max(
                    ...gaps.map(
                        gap => gap.gap || 0
                    )
                );


            document.getElementById(
                "biggestGap"
            ).textContent =
                biggestGap + "%";


            analysisList.innerHTML = "";


            gaps.forEach(gap => {

                const skillName =
                    skillMap[gap.skillId] ||
                    "Skill";

                const current =
                    gap.currentLevel || 0;

                const required =
                    gap.requiredLevel || 0;

                const gapValue =
                    gap.gap || 0;


                const item =
                    document.createElement("div");

                item.className =
                    "analysis-item";


                item.innerHTML = `

                    <div class="analysis-item-top">

                        <span class="analysis-skill-name">
                            ${skillName}
                        </span>

                        <span class="analysis-gap-badge">
                            ${
                                gapValue > 0
                                    ? gapValue + "% gap"
                                    : "On track ✓"
                            }
                        </span>

                    </div>


                    <div class="analysis-levels">

                        <span>
                            Current:
                            <strong>
                                ${current}%
                            </strong>
                        </span>

                        <span>
                            Target:
                            <strong>
                                ${required}%
                            </strong>
                        </span>

                    </div>


                    <div class="analysis-progress">

                        <div
                            class="analysis-progress-fill"
                            style="width: ${Math.min(current, 100)}%;">
                        </div>

                    </div>


                    <p class="analysis-item-description">

                        ${
                            gapValue > 0
                                ? `You need ${gapValue}% more to reach the required level for your career.`
                                : "You're currently meeting the required level for this skill."
                        }

                    </p>

                `;


                analysisList.appendChild(item);

            });


        } catch (error) {

            console.error(
                "Skill analysis error:",
                error
            );

            analysisList.innerHTML = `
                <div class="analysis-empty">

                    <h3>
                        Couldn't load your analysis ♡
                    </h3>

                    <p>
                        Make sure Spring Boot is running
                        and try again.
                    </p>

                </div>
            `;
        }
    }


    loadSkillAnalysisPage();
}


// ======================================================
// ROADMAP PAGE
// ======================================================

const roadmapPageList =
    document.getElementById(
        "roadmapPageList"
    );


if (roadmapPageList) {

    loadRoadmapPage();

}


async function loadRoadmapPage() {

    const user =
        getStoredUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const userResponse =
            await fetch(
                `${API}/api/users/${user.userId}`
            );


        const userData =
            await userResponse.json();


        const careerName =
            userData.career?.careerName ||
            "Your Career";


        const careerElement =
            document.getElementById(
                "roadmapCareer"
            );


        if (careerElement) {

            careerElement.textContent =
                careerName;

        }


        const response =
            await fetch(
                `${API}/api/roadmaps`
            );


        if (!response.ok) {
            throw new Error(
                "Could not load roadmap"
            );
        }


        const roadmaps =
            await response.json();


        const userRoadmaps =
            roadmaps.filter(
                roadmap =>
                    roadmap.user?.userId ===
                    user.userId
            );


        if (!userRoadmaps.length) {

            roadmapPageList.innerHTML = `

                <div class="roadmap-page-loading">

                    <span>♡</span>

                    <p>
                        Your roadmap is empty.
                        Complete an assessment first.
                    </p>

                </div>

            `;

            return;

        }


        roadmapPageList.innerHTML =
            "";


        userRoadmaps.forEach(
            (roadmap, index) => {

                const skillName =
                    roadmap.skill?.skillName ||
                    "Skill";


                const currentLevel =
                    roadmap.currentLevel ??
                    0;


                const targetLevel =
                    roadmap.targetLevel ??
                    0;


                const status =
                    roadmap.status ||
                    "Not Started";


                roadmapPageList.innerHTML += `

                    <div class="roadmap-page-item">

                        <div class="roadmap-page-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>


                        <div class="roadmap-page-content">

                            <h3>
                                Improve ${skillName}
                            </h3>

                            <p>
                                ${roadmap.learningResource ||
                                `Improve ${skillName} from ${currentLevel} to ${targetLevel}`}
                            </p>

                        </div>


                        <select
                            class="roadmap-status-select"
                            data-roadmap-id="${roadmap.roadmapId}">

                            <option
                                value="Not Started"
                                ${status === "Not Started"
                                    ? "selected"
                                    : ""}>
                                Not Started
                            </option>

                            <option
                                value="In Progress"
                                ${status === "In Progress"
                                    ? "selected"
                                    : ""}>
                                In Progress
                            </option>

                            <option
                                value="Completed"
                                ${status === "Completed"
                                    ? "selected"
                                    : ""}>
                                Completed
                            </option>

                        </select>

                    </div>

                `;

            }
        );


        document
            .querySelectorAll(
                ".roadmap-status-select"
            )
            .forEach(
                select => {

                    select.addEventListener(
                        "change",
                        async function () {

                            const roadmapId =
                                this.dataset.roadmapId;


                            const status =
                                this.value;


                            try {

                                const updateResponse =
                                    await fetch(
                                        `${API}/api/roadmaps/${roadmapId}/status?status=${encodeURIComponent(status)}`,
                                        {
                                            method: "PUT"
                                        }
                                    );


                                if (!updateResponse.ok) {
                                    throw new Error(
                                        "Status update failed"
                                    );
                                }


                            } catch (error) {

                                console.error(
                                    "Roadmap status error:",
                                    error
                                );


                                alert(
                                    "Could not update the roadmap status."
                                );

                            }

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            "Roadmap page error:",
            error
        );


        roadmapPageList.innerHTML = `

            <div class="roadmap-page-loading">

                <span>♡</span>

                <p>
                    Couldn't load your roadmap.
                    Make sure Spring Boot is running.
                </p>

            </div>

        `;

    }

}


// ======================================================
// RECOMMENDED PROJECTS
// ======================================================

const projectList =
    document.getElementById(
        "projectList"
    );


if (projectList) {

    loadRecommendedProjects();

}


async function loadRecommendedProjects() {

    const user =
        getStoredUser();


    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const userResponse =
            await fetch(
                `${API}/api/users/${user.userId}`
            );


        if (!userResponse.ok) {
            throw new Error(
                "Could not load user"
            );
        }


        const userData =
            await userResponse.json();


        const careerId =
            userData.career?.careerId;


        if (!careerId) {

            projectList.innerHTML = `

                <div class="project-empty">

                    <h3>
                        Choose your career first ♡
                    </h3>

                    <p>
                        We need your career goal to
                        recommend the right projects.
                    </p>

                </div>

            `;

            return;

        }


        const response =
            await fetch(
                `${API}/api/projects/recommend?userId=${user.userId}&careerId=${careerId}`
            );


        if (!response.ok) {
            throw new Error(
                "Could not load projects"
            );
        }


        const projects =
            await response.json();


        if (!projects.length) {

            projectList.innerHTML = `

                <div class="project-empty">

                    <h3>
                        No projects yet ✨
                    </h3>

                    <p>
                        Complete more assessments to get
                        personalized project recommendations.
                    </p>

                </div>

            `;

            return;

        }


        projectList.innerHTML = `
            <div class="project-grid"></div>
        `;


        const projectGrid =
            projectList.querySelector(
                ".project-grid"
            );


        projects.forEach(
            (project, index) => {

                const skillName =
                    project.skill?.skillName ||
                    "Skill";


                const difficulty =
                    project.difficulty ||
                    "Beginner";


                projectGrid.innerHTML += `

                    <div class="project-item">

                        <div class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>


                        <span class="project-difficulty">
                            ${difficulty}
                        </span>


                        <h3>
                            ${project.projectName}
                        </h3>


                        <p>
                            ${project.projectDescription}
                        </p>


                        <div class="project-skill">

                            <span>
                                Recommended for
                            </span>

                            <strong>
                                ${skillName}
                            </strong>

                        </div>

                    </div>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Project recommendation error:",
            error
        );


        projectList.innerHTML = `

            <div class="project-empty">

                <h3>
                    Couldn't load projects ♡
                </h3>

                <p>
                    Make sure Spring Boot is running
                    and try again.
                </p>

            </div>

        `;

    }

}