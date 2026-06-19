import { useSyncExternalStore } from "react";
import {
  CAREER_TRACKS,
  HOME_SIGNALS,
  JOBS_CATALOG,
  RESOURCES_CATALOG,
  SKILLS_CATALOG
} from "../data/placement-data.js";

const STORAGE_KEYS = {
  database: "jobhack-lite:db",
  legacyAccounts: "jobhack-lite:accounts",
  session: "jobhack-lite:session",
  flash: "jobhack-lite:flash",
  authRedirect: "jobhack-lite:auth-redirect"
};

const APP_CONFIG = {
  version: 4,
  activityLimit: 8,
  maxActivitiesPerUser: 60,
  maxProofAttachmentBytes: 2 * 1024 * 1024,
  demoAccount: {
    fullName: "Haricharan",
    email: "student@jobhack.demo",
    password: "JobHack123",
    college: "KL University",
    branch: "CSE",
    graduationYear: "2027",
    cgpa: 8.2,
    activeBacklogs: 0,
    trackId: "frontend-development",
    targetRole: "Frontend Developer",
    placementType: "internship",
    preferredLocations: ["Remote", "Bengaluru", "Hyderabad"],
    weeklyFocus: "Close two strong-fit applications and prepare for one interview round.",
    bio: "Campus placement candidate focused on frontend product roles with strong UI delivery and practical proof."
  },
  applicationStages: [
    { id: "Applied", label: "Applied" },
    { id: "Shortlisted", label: "Shortlisted" },
    { id: "Interview", label: "Interview" },
    { id: "Offer", label: "Offer" },
    { id: "Rejected", label: "Rejected" }
  ],
  plannerCategories: [
    { id: "Application", label: "Application" },
    { id: "Follow-up", label: "Follow-up" },
    { id: "Aptitude", label: "Aptitude" },
    { id: "Interview", label: "Interview" },
    { id: "Project", label: "Project" },
    { id: "Document", label: "Document" }
  ],
  taskPriorities: [
    { id: "High", label: "High" },
    { id: "Medium", label: "Medium" },
    { id: "Low", label: "Low" }
  ],
  applicationSources: [
    { id: "Campus drive", label: "Campus drive" },
    { id: "Job board", label: "Job board" },
    { id: "Referral", label: "Referral" },
    { id: "Manual entry", label: "Manual entry" }
  ],
  placementTypes: [
    { id: "internship", label: "Internship" },
    { id: "full-time", label: "Full-time" },
    { id: "either", label: "Either" }
  ],
  jobMatchFilters: [
    { id: "all", label: "All openings" },
    { id: "eligible", label: "Eligible only" },
    { id: "strong", label: "Strong fit" }
  ],
  roundStatuses: [
    { id: "Scheduled", label: "Scheduled" },
    { id: "Completed", label: "Completed" },
    { id: "Cleared", label: "Cleared" },
    { id: "Rejected", label: "Rejected" }
  ],
  proofItemTypes: [
    { id: "certificate", label: "Certificate" },
    { id: "project", label: "Project" },
    { id: "coding-practice", label: "Coding practice" },
    { id: "mock-interview", label: "Mock interview" }
  ],
  profileRequiredFields: ["branch", "graduationYear", "cgpa"]
};

const REFERENCE_DATA = {
  skillsCatalog: SKILLS_CATALOG,
  careerTracks: CAREER_TRACKS,
  jobsCatalog: JOBS_CATALOG,
  resourcesCatalog: RESOURCES_CATALOG,
  homeSignals: HOME_SIGNALS
};

const storeListeners = new Set();
let noticeTimeoutId = null;

let storeState = {
  database: null,
  session: null,
  notice: null,
  authRedirect: ""
};

const dateFormatters = {
  full: new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }),
  short: new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short"
  })
};

function replaceStoreState(patch) {
  storeState = {
    ...storeState,
    ...patch
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-5)}`;
}

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTimestamp(value) {
  const parsed = new Date(value || Date.now());
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function normalizeDateOnly(value, fallbackValue = "") {
  const input = String(value || "").trim();
  if (!input) {
    return fallbackValue;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackValue;
  }

  return parsed.toISOString().slice(0, 10);
}

function addDays(date, offset) {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next.toISOString().slice(0, 10);
}

function clampNumber(value, min, max) {
  const next = Number(value);
  if (Number.isNaN(next)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(next)));
}

function daysBetween(left, right) {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  leftDate.setHours(0, 0, 0, 0);
  rightDate.setHours(0, 0, 0, 0);
  return Math.round((rightDate.getTime() - leftDate.getTime()) / 86400000);
}

function hoursBetween(left, right) {
  return Math.round((new Date(right).getTime() - new Date(left).getTime()) / 3600000);
}

function isPast(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(isoDate).getTime() < today.getTime();
}

function sameJson(left, right) {
  return JSON.stringify(left || null) === JSON.stringify(right || null);
}

function hashPassword(value) {
  const input = String(value || "");
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash) + input.charCodeAt(index);
    hash &= hash;
  }

  return `hash_${(hash >>> 0).toString(36)}`;
}

function getInitials(name) {
  return String(name || "JobHack")
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0) || "")
    .join("")
    .toUpperCase();
}

function formatDate(isoDate) {
  return dateFormatters.full.format(new Date(isoDate));
}

function formatShortDate(isoDate) {
  return dateFormatters.short.format(new Date(isoDate));
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function formatDueStatus(isoDate) {
  const difference = daysBetween(new Date(), new Date(isoDate));

  if (difference < -1) {
    return `${Math.abs(difference)} days overdue`;
  }

  if (difference === -1) {
    return "yesterday";
  }

  if (difference === 0) {
    return "today";
  }

  if (difference === 1) {
    return "tomorrow";
  }

  if (difference <= 7) {
    return `in ${difference} days`;
  }

  return `on ${formatShortDate(isoDate)}`;
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBranch(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeCgpa(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const next = Number(value);
  if (Number.isNaN(next)) {
    return null;
  }

  return Math.max(0, Math.min(10, Math.round(next * 100) / 100));
}

function normalizeInteger(value, fallbackValue = 0) {
  if (value === null || value === undefined || value === "") {
    return fallbackValue;
  }

  const next = Number(value);
  if (Number.isNaN(next)) {
    return fallbackValue;
  }

  return Math.max(0, Math.round(next));
}

function normalizePlacementType(value) {
  return APP_CONFIG.placementTypes.some((item) => item.id === value) ? value : "either";
}

function normalizeApplicationStage(value) {
  return APP_CONFIG.applicationStages.some((stage) => stage.id === value) ? value : "Applied";
}

function normalizePlannerCategory(value) {
  return APP_CONFIG.plannerCategories.some((item) => item.id === value) ? value : "Application";
}

function normalizeTaskPriority(value) {
  return APP_CONFIG.taskPriorities.some((item) => item.id === value) ? value : "Medium";
}

function normalizeApplicationSource(value) {
  return APP_CONFIG.applicationSources.some((item) => item.id === value) ? value : "Manual entry";
}

function normalizeRoundStatus(value) {
  return APP_CONFIG.roundStatuses.some((item) => item.id === value) ? value : "Scheduled";
}

function normalizeProofType(value) {
  return APP_CONFIG.proofItemTypes.some((item) => item.id === value) ? value : "certificate";
}

function normalizeProofAttachment(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const fileName = String(value.fileName || value.name || "").trim();
  const fileType = String(value.fileType || value.type || "").trim() || "application/octet-stream";
  const fileSize = normalizeInteger(value.fileSize ?? value.size, 0);
  const dataUrl = String(value.dataUrl || "").trim();

  if (!fileName || !dataUrl) {
    return null;
  }

  return {
    fileName,
    fileType,
    fileSize,
    dataUrl
  };
}

function getPriorityRank(priority) {
  if (priority === "High") {
    return 0;
  }

  if (priority === "Medium") {
    return 1;
  }

  return 2;
}

function inferPriorityFromTaskType(taskType) {
  if (taskType === "Interview" || taskType === "Follow-up" || taskType === "Application") {
    return "High";
  }

  if (taskType === "Project" || taskType === "Document") {
    return "Medium";
  }

  return "Low";
}

function validateFilled(value, message) {
  if (!String(value || "").trim()) {
    throw new Error(message);
  }
}

function validateDateInput(value, message) {
  if (!normalizeDateOnly(value, "")) {
    throw new Error(message);
  }
}

function validateTrack(trackId) {
  if (!REFERENCE_DATA.careerTracks.some((track) => track.id === trackId)) {
    throw new Error("Choose a career path.");
  }
}

function validateRegistration(input) {
  if (String(input.fullName || "").trim().length < 2) {
    throw new Error("Enter a full name with at least 2 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new Error("Enter a valid email address.");
  }

  if (String(input.password || "").length < 6) {
    throw new Error("Use a password with at least 6 characters.");
  }

  if (String(input.password || "") !== String(input.confirmPassword || "")) {
    throw new Error("Passwords do not match.");
  }

  validateTrack(input.trackId);
}

function loadJson(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : clone(fallbackValue);
  } catch (error) {
    return clone(fallbackValue);
  }
}

function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getCareerTrackById(trackId, careerTracks = REFERENCE_DATA.careerTracks) {
  const list = Array.isArray(careerTracks) ? careerTracks : REFERENCE_DATA.careerTracks;
  return list.find((track) => track.id === trackId) || list[0];
}

function getSkillById(skillId, skillsCatalog = REFERENCE_DATA.skillsCatalog) {
  const list = Array.isArray(skillsCatalog) ? skillsCatalog : REFERENCE_DATA.skillsCatalog;
  return list.find((skill) => skill.id === skillId) || list[0];
}

function normalizeSkillIds(values) {
  const validIds = new Set(REFERENCE_DATA.skillsCatalog.map((skill) => skill.id));
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value || ""))
    .filter((value) => validIds.has(value));
}

function normalizeLookupKey(company, title) {
  return `${normalizeQuery(company)}::${normalizeQuery(title)}`;
}

function matchesSearch(item, query, fields) {
  return fields.some((field) => normalizeQuery(item[field]).indexOf(query) >= 0);
}

function buildDatabase() {
  return {
    version: APP_CONFIG.version,
    updatedAt: new Date().toISOString(),
    careerTracks: clone(REFERENCE_DATA.careerTracks),
    skillsCatalog: clone(REFERENCE_DATA.skillsCatalog),
    jobsCatalog: clone(REFERENCE_DATA.jobsCatalog),
    resourcesCatalog: clone(REFERENCE_DATA.resourcesCatalog),
    users: [],
    applications: [],
    plannerTasks: [],
    proofItems: [],
    skills: [],
    activities: []
  };
}

function getTrackSkillIds(trackId, jobsCatalog = REFERENCE_DATA.jobsCatalog, resourcesCatalog = REFERENCE_DATA.resourcesCatalog) {
  const track = getCareerTrackById(trackId);
  const skillIds = new Set(track.coreSkillIds);

  jobsCatalog.forEach((job) => {
    if (job.careerTrackId !== track.id) {
      return;
    }

    job.requiredSkillIds.forEach((skillId) => skillIds.add(skillId));
    job.preferredSkillIds.forEach((skillId) => skillIds.add(skillId));
  });

  resourcesCatalog.forEach((resource) => {
    if (!resource.careerTrackIds.includes(track.id)) {
      return;
    }

    resource.skillTags.forEach((skillId) => skillIds.add(skillId));
  });

  return Array.from(skillIds);
}

function normalizeUserRow(row) {
  const next = clone(row || {});
  let changed = false;
  const track = getCareerTrackById(next.trackId, REFERENCE_DATA.careerTracks);

  if (!next.id) {
    next.id = createId("user");
    changed = true;
  }

  const email = normalizeEmail(next.email);
  if (next.email !== email) {
    next.email = email;
    changed = true;
  }

  if (typeof next.password === "string" && !next.passwordHash) {
    next.passwordHash = hashPassword(next.password);
    delete next.password;
    changed = true;
  } else if (typeof next.password === "string") {
    delete next.password;
    changed = true;
  }

  if (!next.passwordHash) {
    next.passwordHash = hashPassword(next.email === APP_CONFIG.demoAccount.email ? APP_CONFIG.demoAccount.password : "jobhack-lite");
    changed = true;
  }

  next.fullName = String(next.fullName || "Placement Candidate").trim();
  next.college = String(next.college || "").trim();
  next.branch = normalizeBranch(next.branch);
  next.graduationYear = String(next.graduationYear || "").trim();
  next.cgpa = normalizeCgpa(next.cgpa);
  next.activeBacklogs = normalizeInteger(next.activeBacklogs, 0);
  next.trackId = track.id;
  next.targetRole = String(next.targetRole || track.targetRoles[0]).trim() || track.targetRoles[0];
  next.placementType = normalizePlacementType(next.placementType);
  next.preferredLocations = normalizeStringArray(next.preferredLocations);
  next.weeklyFocus = String(next.weeklyFocus || "Keep one real next action moving every day.").trim();
  next.bio = String(next.bio || "Focused on campus placements and building proof for the roles that match this profile.").trim();

  const createdAt = normalizeTimestamp(next.createdAt);
  const updatedAt = normalizeTimestamp(next.updatedAt || createdAt);

  if (next.createdAt !== createdAt) {
    next.createdAt = createdAt;
    changed = true;
  }

  if (next.updatedAt !== updatedAt) {
    next.updatedAt = updatedAt;
    changed = true;
  }

  return { row: next, changed };
}

function normalizeRoundRow(round) {
  const next = clone(round || {});
  let changed = false;

  if (!next.id) {
    next.id = createId("round");
    changed = true;
  }

  next.name = String(next.name || "Interview round").trim();
  next.date = normalizeDateOnly(next.date, addDays(new Date(), 1));

  const status = normalizeRoundStatus(next.status);
  if (next.status !== status) {
    next.status = status;
    changed = true;
  }

  next.notes = String(next.notes || "").trim();

  return { row: next, changed };
}

function findCatalogJob(jobId, jobsCatalog = REFERENCE_DATA.jobsCatalog) {
  return jobsCatalog.find((job) => job.id === jobId) || null;
}

function findCatalogJobByCompanyRole(company, title, jobsCatalog = REFERENCE_DATA.jobsCatalog) {
  const targetKey = normalizeLookupKey(company, title);
  return jobsCatalog.find((job) => normalizeLookupKey(job.company, job.title) === targetKey) || null;
}

function isProfileEligibilityReady(userLike) {
  return APP_CONFIG.profileRequiredFields.every((field) => {
    if (field === "cgpa") {
      return typeof userLike.cgpa === "number";
    }

    return Boolean(String(userLike[field] || "").trim());
  });
}

function evaluateJobEligibility(userLike, job) {
  if (!isProfileEligibilityReady(userLike)) {
    return "Profile incomplete";
  }

  const branch = normalizeBranch(userLike.branch);
  if (job.eligibleBranches.length && !job.eligibleBranches.includes(branch)) {
    return "Not eligible";
  }

  if (typeof userLike.cgpa === "number" && userLike.cgpa < Number(job.minCgpa || 0)) {
    return "Not eligible";
  }

  if (normalizeInteger(userLike.activeBacklogs, 0) > Number(job.maxBacklogs || 0)) {
    return "Not eligible";
  }

  return "Eligible";
}

function normalizeApplicationRow(row, userRow, database) {
  const next = clone(row || {});
  let changed = false;
  const referenceJob = findCatalogJob(next.catalogJobId, database?.jobsCatalog || REFERENCE_DATA.jobsCatalog) ||
    findCatalogJobByCompanyRole(next.company, next.title, database?.jobsCatalog || REFERENCE_DATA.jobsCatalog);
  const track = getCareerTrackById(next.trackId || userRow?.trackId || referenceJob?.careerTrackId);

  if (!next.id || String(next.id).startsWith("job-")) {
    next.id = createId("app");
    changed = true;
  }

  next.catalogJobId = referenceJob?.id || String(next.catalogJobId || "");
  next.userId = String(next.userId || userRow?.id || "");
  next.company = String(next.company || referenceJob?.company || "Opportunity").trim();
  next.title = String(next.title || referenceJob?.title || "Placement role").trim();
  next.location = String(next.location || referenceJob?.location || "").trim();
  next.source = normalizeApplicationSource(next.source || referenceJob?.source);
  next.jobUrl = String(next.jobUrl || referenceJob?.jobUrl || "").trim();
  next.salaryOrStipend = String(next.salaryOrStipend || referenceJob?.salaryOrStipend || "").trim();
  next.deadline = normalizeDateOnly(next.deadline, referenceJob?.deadline || addDays(new Date(), 7));
  next.trackId = track.id;

  const stage = normalizeApplicationStage(next.stage);
  if (next.stage !== stage) {
    next.stage = stage;
    changed = true;
  }

  next.nextAction = String(next.nextAction || "").trim();
  next.nextActionDueDate = normalizeDateOnly(next.nextActionDueDate, "");
  next.resumeVersion = String(next.resumeVersion || "").trim();
  next.notes = String(next.notes || "").trim();

  const matchSkillIds = normalizeSkillIds(
    next.matchSkillIds ||
    referenceJob?.requiredSkillIds?.concat(referenceJob?.preferredSkillIds || []) ||
    track.coreSkillIds
  );
  if (!sameJson(next.matchSkillIds, matchSkillIds)) {
    next.matchSkillIds = matchSkillIds;
    changed = true;
  }

  const rounds = (Array.isArray(next.rounds) ? next.rounds : []).map((round) => normalizeRoundRow(round).row);
  if (!sameJson(next.rounds, rounds)) {
    next.rounds = rounds;
    changed = true;
  }

  if (userRow) {
    next.eligibilityStatus = evaluateJobEligibility(userRow, referenceJob || {
      eligibleBranches: [],
      minCgpa: 0,
      maxBacklogs: Number.MAX_SAFE_INTEGER
    });
  } else {
    next.eligibilityStatus = String(next.eligibilityStatus || "");
  }

  next.createdAt = normalizeTimestamp(next.createdAt || new Date().toISOString());
  next.updatedAt = normalizeTimestamp(next.updatedAt || next.createdAt);

  return { row: next, changed };
}

function normalizePlannerTaskRow(row) {
  const next = clone(row || {});
  let changed = false;

  if (!next.id) {
    next.id = createId("task");
    changed = true;
  }

  next.userId = String(next.userId || "");
  next.title = String(next.title || "Placement task").trim();
  next.dueDate = normalizeDateOnly(next.dueDate, addDays(new Date(), 2));
  next.type = normalizePlannerCategory(next.type);
  next.priority = normalizeTaskPriority(next.priority || inferPriorityFromTaskType(next.type));
  next.done = Boolean(next.done);
  next.applicationId = String(next.applicationId || "");
  next.skillId = String(next.skillId || "");
  next.autoKey = String(next.autoKey || "");
  next.createdAt = normalizeTimestamp(next.createdAt || new Date().toISOString());
  next.updatedAt = normalizeTimestamp(next.updatedAt || next.createdAt);

  return { row: next, changed };
}

function normalizeProofItemRow(row) {
  const next = clone(row || {});
  let changed = false;

  if (!next.id) {
    next.id = createId("proof");
    changed = true;
  }

  next.userId = String(next.userId || "");
  next.type = normalizeProofType(next.type || (next.name ? "certificate" : ""));
  next.title = String(next.title || next.name || "Proof item").trim();
  next.source = String(next.source || next.issuer || "Self-reported").trim();
  next.url = String(next.url || "").trim();
  const attachment = normalizeProofAttachment(
    next.attachment || (
      next.fileName || next.fileType || next.fileSize || next.dataUrl
        ? {
            fileName: next.fileName,
            fileType: next.fileType,
            fileSize: next.fileSize,
            dataUrl: next.dataUrl
          }
        : null
    )
  );
  if (!sameJson(next.attachment, attachment)) {
    next.attachment = attachment;
    changed = true;
  }
  next.skillId = normalizeSkillIds([next.skillId || next.skillTag])[0] || REFERENCE_DATA.skillsCatalog[0].id;
  next.date = normalizeDateOnly(next.date, addDays(new Date(), -3));
  next.notes = String(next.notes || "").trim();
  next.createdAt = normalizeTimestamp(next.createdAt || new Date().toISOString());
  next.updatedAt = normalizeTimestamp(next.updatedAt || next.createdAt);

  if (next.name || next.issuer || next.skillTag) {
    delete next.name;
    delete next.issuer;
    delete next.skillTag;
    changed = true;
  }

  if ("fileName" in next || "fileType" in next || "fileSize" in next || "dataUrl" in next) {
    delete next.fileName;
    delete next.fileType;
    delete next.fileSize;
    delete next.dataUrl;
    changed = true;
  }

  return { row: next, changed };
}

function normalizeSkillRow(row) {
  const next = clone(row || {});
  let changed = false;
  const skillId = next.skillId || next.id || REFERENCE_DATA.skillsCatalog[0].id;
  const skill = getSkillById(skillId, REFERENCE_DATA.skillsCatalog);

  if (!next.id || next.id === skillId) {
    next.id = createId("skill");
    changed = true;
  }

  next.userId = String(next.userId || "");
  next.skillId = skill.id;
  next.label = skill.label;
  next.category = skill.category;
  next.level = clampNumber(Number(next.level || 0), 0, 100);
  next.updatedAt = normalizeTimestamp(next.updatedAt || new Date().toISOString());

  return { row: next, changed };
}

function normalizeActivityRow(row) {
  const next = clone(row || {});
  let changed = false;

  if (!next.id) {
    next.id = createId("activity");
    changed = true;
  }

  next.userId = String(next.userId || "");
  next.actionType = String(next.actionType || "note");
  next.entityType = String(next.entityType || "activity");
  next.entityId = String(next.entityId || "");
  next.title = String(next.title || "Profile updated");
  next.meta = String(next.meta || "");
  next.createdAt = normalizeTimestamp(next.createdAt || new Date().toISOString());

  return { row: next, changed };
}

function normalizeTable(database, tableName, normalizer) {
  const items = Array.isArray(database[tableName]) ? database[tableName] : [];
  let changed = !Array.isArray(database[tableName]);

  database[tableName] = items.map((item) => {
    const result = normalizer(item);
    changed = changed || result.changed;
    return result.row;
  });

  return changed;
}

function ensureUserSkillRows(database, userRow) {
  const existingSkillIds = new Set(
    database.skills
      .filter((item) => item.userId === userRow.id)
      .map((item) => item.skillId)
  );

  let changed = false;

  getTrackSkillIds(userRow.trackId, database.jobsCatalog, database.resourcesCatalog).forEach((skillId) => {
    if (existingSkillIds.has(skillId)) {
      return;
    }

    database.skills.push(normalizeSkillRow({
      userId: userRow.id,
      skillId,
      level: 0,
      updatedAt: new Date().toISOString()
    }).row);
    changed = true;
  });

  return changed;
}

function trimActivitiesForUser(database, userId) {
  const userActivities = database.activities
    .filter((item) => item.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, APP_CONFIG.maxActivitiesPerUser);

  const keepIds = new Set(userActivities.map((item) => item.id));
  database.activities = database.activities.filter((item) => item.userId !== userId || keepIds.has(item.id));
}

function recordActivity(database, input) {
  database.activities.unshift(normalizeActivityRow({
    userId: input.userId,
    actionType: input.actionType,
    entityType: input.entityType,
    entityId: input.entityId,
    title: input.title,
    meta: input.meta,
    createdAt: input.createdAt || new Date().toISOString()
  }).row);

  trimActivitiesForUser(database, input.userId);
}

function upsertAutoTask(database, taskShape) {
  const existing = database.plannerTasks.find((task) => task.userId === taskShape.userId && task.autoKey === taskShape.autoKey);
  const normalized = normalizePlannerTaskRow(taskShape).row;

  if (existing) {
    existing.title = normalized.title;
    existing.dueDate = normalized.dueDate;
    existing.type = normalized.type;
    existing.priority = normalized.priority;
    existing.applicationId = normalized.applicationId;
    existing.skillId = normalized.skillId;
    existing.updatedAt = normalizeTimestamp(new Date().toISOString());
    return existing;
  }

  database.plannerTasks.unshift(normalized);
  return normalized;
}

function removeAutoTask(database, userId, autoKey) {
  database.plannerTasks = database.plannerTasks.filter((task) => !(task.userId === userId && task.autoKey === autoKey));
}

function syncApplicationAutomation(database, userRow, application) {
  const closedStage = application.stage === "Offer" || application.stage === "Rejected";
  const followUpAutoKey = `application:${application.id}`;

  if (!closedStage && application.nextAction && application.nextActionDueDate) {
    upsertAutoTask(database, {
      userId: userRow.id,
      title: application.nextAction,
      dueDate: application.nextActionDueDate,
      type: "Follow-up",
      priority: "High",
      applicationId: application.id,
      autoKey: followUpAutoKey,
      done: false
    });
  } else {
    removeAutoTask(database, userRow.id, followUpAutoKey);
  }

  application.rounds.forEach((round) => {
    const roundAutoKey = `round:${application.id}:${round.id}`;
    const shouldKeep = !closedStage && round.date && round.status === "Scheduled" && !isPast(round.date);

    if (shouldKeep) {
      upsertAutoTask(database, {
        userId: userRow.id,
        title: `${application.company}: ${round.name}`,
        dueDate: round.date,
        type: "Interview",
        priority: "High",
        applicationId: application.id,
        autoKey: roundAutoKey,
        done: false
      });
    } else {
      removeAutoTask(database, userRow.id, roundAutoKey);
    }
  });

  const roundKeys = new Set(application.rounds.map((round) => `round:${application.id}:${round.id}`));
  database.plannerTasks = database.plannerTasks.filter((task) => {
    if (task.userId !== userRow.id || !task.autoKey.startsWith(`round:${application.id}:`)) {
      return true;
    }

    return roundKeys.has(task.autoKey);
  });
}

function syncApplicationsForUser(database, userRow) {
  database.applications = database.applications.map((application) => {
    if (application.userId !== userRow.id) {
      return application;
    }

    const normalized = normalizeApplicationRow(application, userRow, database).row;
    syncApplicationAutomation(database, userRow, normalized);
    return normalized;
  });
}

function normalizeDatabase(database) {
  const next = clone(database || {});
  let changed = false;

  if (next.version !== APP_CONFIG.version) {
    next.version = APP_CONFIG.version;
    changed = true;
  }

  if (!sameJson(next.careerTracks, REFERENCE_DATA.careerTracks)) {
    next.careerTracks = clone(REFERENCE_DATA.careerTracks);
    changed = true;
  }

  if (!sameJson(next.skillsCatalog, REFERENCE_DATA.skillsCatalog)) {
    next.skillsCatalog = clone(REFERENCE_DATA.skillsCatalog);
    changed = true;
  }

  if (!sameJson(next.jobsCatalog, REFERENCE_DATA.jobsCatalog)) {
    next.jobsCatalog = clone(REFERENCE_DATA.jobsCatalog);
    changed = true;
  }

  if (!sameJson(next.resourcesCatalog, REFERENCE_DATA.resourcesCatalog)) {
    next.resourcesCatalog = clone(REFERENCE_DATA.resourcesCatalog);
    changed = true;
  }

  if (Array.isArray(next.certifications) && !Array.isArray(next.proofItems)) {
    next.proofItems = next.certifications.map((item) => normalizeProofItemRow(item).row);
    delete next.certifications;
    changed = true;
  }

  changed = normalizeTable(next, "users", normalizeUserRow) || changed;
  changed = normalizeTable(next, "plannerTasks", normalizePlannerTaskRow) || changed;
  changed = normalizeTable(next, "proofItems", normalizeProofItemRow) || changed;
  changed = normalizeTable(next, "skills", normalizeSkillRow) || changed;
  changed = normalizeTable(next, "activities", normalizeActivityRow) || changed;

  const userMap = new Map(next.users.map((user) => [user.id, user]));
  const applicationItems = Array.isArray(next.applications) ? next.applications : [];
  next.applications = applicationItems.map((item) => {
    const result = normalizeApplicationRow(item, userMap.get(item.userId), next);
    changed = changed || result.changed;
    return result.row;
  });

  next.users.forEach((userRow) => {
    changed = ensureUserSkillRows(next, userRow) || changed;
    syncApplicationsForUser(next, userRow);
  });

  if (!next.updatedAt) {
    next.updatedAt = new Date().toISOString();
    changed = true;
  }

  return { database: next, changed };
}

function findById(collection, itemId) {
  return Array.isArray(collection)
    ? collection.find((item) => item.id === itemId) || null
    : null;
}

function sanitizeUserRecord(userRow) {
  const next = clone(userRow);
  delete next.passwordHash;
  delete next.password;
  return next;
}

function getEmptySession() {
  return {
    userId: "",
    email: "",
    issuedAt: ""
  };
}

function readSession() {
  if (!storeState.session) {
    replaceStoreState({ session: loadJson(STORAGE_KEYS.session, getEmptySession()) });
  }

  return storeState.session;
}

function writeSession(userRow) {
  replaceStoreState({
    session: {
      userId: userRow.id,
      email: userRow.email,
      issuedAt: new Date().toISOString()
    }
  });
  saveJson(STORAGE_KEYS.session, storeState.session);
}

function clearSession() {
  replaceStoreState({ session: getEmptySession() });
  saveJson(STORAGE_KEYS.session, storeState.session);
  window.localStorage.removeItem(STORAGE_KEYS.authRedirect);
}

function readDatabase() {
  if (storeState.database) {
    return storeState.database;
  }

  const database = loadJson(STORAGE_KEYS.database, null);
  if (!database || typeof database !== "object") {
    replaceStoreState({ database: buildDatabase() });
    saveJson(STORAGE_KEYS.database, storeState.database);
    return storeState.database;
  }

  const normalized = normalizeDatabase(database);
  replaceStoreState({ database: normalized.database });
  if (normalized.changed) {
    saveJson(STORAGE_KEYS.database, storeState.database);
  }
  return storeState.database;
}

function writeDatabase(database) {
  replaceStoreState({ database });
  saveJson(STORAGE_KEYS.database, database);
}

function updateDatabase(mutator) {
  const database = clone(readDatabase());
  mutator(database);
  database.updatedAt = new Date().toISOString();

  const normalized = normalizeDatabase(database);
  writeDatabase(normalized.database);
  emit();
  return normalized.database;
}

function buildDemoSeed(userRow, database) {
  const now = new Date().toISOString();
  const jobs = database.jobsCatalog.filter((job) => job.careerTrackId === userRow.trackId).slice(0, 2);

  const applications = jobs.map((job, index) => normalizeApplicationRow({
    userId: userRow.id,
    catalogJobId: job.id,
    company: job.company,
    title: job.title,
    location: job.location,
    source: job.source,
    jobUrl: job.jobUrl,
    salaryOrStipend: job.salaryOrStipend,
    deadline: job.deadline,
    stage: index === 0 ? "Shortlisted" : "Applied",
    nextAction: index === 0 ? "Prepare round-one answers and portfolio talking points" : "Follow up on recruiter confirmation",
    nextActionDueDate: addDays(new Date(), index === 0 ? 1 : 2),
    resumeVersion: index === 0 ? "resume-v3.pdf" : "resume-v2.pdf",
    notes: index === 0 ? "Portfolio walkthrough expected in the first round." : "Applied through campus portal and recruiter email.",
    rounds: index === 0 ? [{
      name: "Technical interview",
      date: addDays(new Date(), 2),
      status: "Scheduled",
      notes: "React state, API flows, and one project deep dive."
    }] : [],
    createdAt: now,
    updatedAt: now
  }, userRow, database).row);

  const proofItems = [
    normalizeProofItemRow({
      userId: userRow.id,
      type: "project",
      title: "Placement dashboard case study",
      source: "Portfolio",
      url: "https://example.com/portfolio/placement-dashboard",
      skillId: "react",
      date: addDays(new Date(), -18),
      notes: "Covers component architecture, API integration, and workflow management."
    }).row,
    normalizeProofItemRow({
      userId: userRow.id,
      type: "certificate",
      title: "Frontend Testing Fundamentals",
      source: "SkillSprint Academy",
      skillId: "testing",
      date: addDays(new Date(), -25),
      notes: "Focused on UI reliability and regression habits."
    }).row
  ];

  const skillRows = getTrackSkillIds(userRow.trackId, database.jobsCatalog, database.resourcesCatalog).map((skillId, index) => normalizeSkillRow({
    userId: userRow.id,
    skillId,
    level: index % 2 === 0 ? 72 : 61,
    updatedAt: now
  }).row);

  const plannerTasks = [
    normalizePlannerTaskRow({
      userId: userRow.id,
      title: "Recheck campus-drive eligibility documents",
      dueDate: addDays(new Date(), 1),
      type: "Document",
      priority: "High",
      done: false
    }).row,
    normalizePlannerTaskRow({
      userId: userRow.id,
      title: "Complete aptitude set for this week",
      dueDate: addDays(new Date(), 3),
      type: "Aptitude",
      priority: "Medium",
      done: false
    }).row
  ];

  return { applications, plannerTasks, proofItems, skills: skillRows };
}

function replaceUserWorkspace(database, userRow, importedData) {
  database.applications = database.applications.filter((item) => item.userId !== userRow.id);
  database.plannerTasks = database.plannerTasks.filter((item) => item.userId !== userRow.id);
  database.proofItems = database.proofItems.filter((item) => item.userId !== userRow.id);
  database.skills = database.skills.filter((item) => item.userId !== userRow.id);
  database.activities = database.activities.filter((item) => item.userId !== userRow.id);

  if (importedData) {
    database.applications = database.applications.concat(importedData.applications);
    database.plannerTasks = database.plannerTasks.concat(importedData.plannerTasks);
    database.proofItems = database.proofItems.concat(importedData.proofItems);
    database.skills = database.skills.concat(importedData.skills);
    database.activities = database.activities.concat(importedData.activities);
  } else {
    ensureUserSkillRows(database, userRow);
  }

  syncApplicationsForUser(database, userRow);
  trimActivitiesForUser(database, userRow.id);
}

function createUserRecord(database, input, options = {}) {
  const now = new Date().toISOString();
  const userRow = normalizeUserRow({
    id: createId("user"),
    fullName: input.fullName,
    email: input.email,
    passwordHash: hashPassword(input.password),
    college: input.college,
    branch: input.branch,
    graduationYear: input.graduationYear,
    cgpa: input.cgpa,
    activeBacklogs: input.activeBacklogs,
    trackId: input.trackId,
    targetRole: input.targetRole,
    placementType: input.placementType,
    preferredLocations: input.preferredLocations,
    weeklyFocus: input.weeklyFocus,
    bio: input.bio,
    createdAt: now,
    updatedAt: now
  }).row;

  database.users.push(userRow);
  ensureUserSkillRows(database, userRow);

  if (options.seedDemo) {
    const seed = buildDemoSeed(userRow, database);
    database.applications = database.applications.concat(seed.applications);
    database.plannerTasks = database.plannerTasks.concat(seed.plannerTasks);
    database.proofItems = database.proofItems.concat(seed.proofItems);
    database.skills = database.skills.filter((item) => item.userId !== userRow.id).concat(seed.skills);
    seed.applications.forEach((application) => syncApplicationAutomation(database, userRow, application));
    recordActivity(database, {
      userId: userRow.id,
      actionType: "account.seeded",
      entityType: "user",
      entityId: userRow.id,
      title: "Demo workspace prepared",
      meta: "Sample applications, proof, and tasks are available for QA."
    });
  }

  trimActivitiesForUser(database, userRow.id);
  return userRow;
}

function ensureDemoAccount() {
  const database = readDatabase();
  const demoUser = database.users.find((user) => user.email === APP_CONFIG.demoAccount.email);

  if (demoUser) {
    return;
  }

  updateDatabase((draft) => {
    createUserRecord(draft, APP_CONFIG.demoAccount, { seedDemo: true });
  });
}

function listUserApplications(userId, database) {
  return clone(database.applications.filter((item) => item.userId === userId));
}

function listUserPlannerTasks(userId, database) {
  return clone(database.plannerTasks.filter((item) => item.userId === userId));
}

function listUserProofItems(userId, database) {
  return clone(database.proofItems.filter((item) => item.userId === userId));
}

function listUserSkills(userId, database) {
  return clone(database.skills.filter((item) => item.userId === userId));
}

function listUserActivities(userId, database) {
  return clone(database.activities.filter((item) => item.userId === userId))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function buildUserView(userRow, database) {
  return {
    id: userRow.id,
    fullName: userRow.fullName,
    email: userRow.email,
    college: userRow.college,
    branch: userRow.branch,
    graduationYear: userRow.graduationYear,
    cgpa: userRow.cgpa,
    activeBacklogs: userRow.activeBacklogs,
    trackId: userRow.trackId,
    targetRole: userRow.targetRole,
    placementType: userRow.placementType,
    preferredLocations: clone(userRow.preferredLocations || []),
    weeklyFocus: userRow.weeklyFocus,
    bio: userRow.bio,
    createdAt: userRow.createdAt,
    updatedAt: userRow.updatedAt,
    workspace: {
      applications: listUserApplications(userRow.id, database),
      planner: listUserPlannerTasks(userRow.id, database),
      proofItems: listUserProofItems(userRow.id, database),
      skills: listUserSkills(userRow.id, database)
    },
    activities: listUserActivities(userRow.id, database)
  };
}

function getSessionUserView() {
  const session = readSession();
  if (!session.userId) {
    return null;
  }

  const database = readDatabase();
  const userRow = findById(database.users, session.userId);
  if (!userRow) {
    clearSession();
    return null;
  }

  return buildUserView(userRow, database);
}

function getSessionUserOrRedirect() {
  const user = getSessionUserView();
  if (user) {
    return user;
  }

  throw new Error("Please sign in again to continue.");
}

function updateCurrentUserRecord(mutator) {
  const session = readSession();

  if (!session.userId) {
    throw new Error("Please sign in again to continue.");
  }

  return updateDatabase((database) => {
    const userRow = findById(database.users, session.userId);
    if (!userRow) {
      throw new Error("Please sign in again to continue.");
    }

    mutator(database, userRow);
    userRow.updatedAt = new Date().toISOString();
    syncApplicationsForUser(database, userRow);
  });
}

function setNotice(type, message) {
  if (noticeTimeoutId) {
    window.clearTimeout(noticeTimeoutId);
    noticeTimeoutId = null;
  }

  replaceStoreState({
    notice: {
      type,
      message
    }
  });

  emit();

  if (type === "success") {
    noticeTimeoutId = window.setTimeout(() => {
      clearNotice();
    }, 2000);
  }
}

function clearNotice() {
  if (noticeTimeoutId) {
    window.clearTimeout(noticeTimeoutId);
    noticeTimeoutId = null;
  }

  replaceStoreState({ notice: null });
  emit();
}

function setAuthRedirect(path) {
  replaceStoreState({ authRedirect: path });
  saveJson(STORAGE_KEYS.authRedirect, {
    path,
    createdAt: new Date().toISOString()
  });
}

function getAuthRedirectOrDefault(fallbackPath) {
  const redirect = loadJson(STORAGE_KEYS.authRedirect, null);
  window.localStorage.removeItem(STORAGE_KEYS.authRedirect);

  if (!redirect || !isSafeAuthRedirect(redirect.path)) {
    return fallbackPath;
  }

  return redirect.path;
}

function isSafeAuthRedirect(path) {
  const basePath = String(path || "").split("#")[0];
  return ["/dashboard", "/placements", "/planner", "/growth", "/account"].includes(basePath);
}

function rememberAuthRedirect(path) {
  if (!path || path === "/login" || path === "/signup" || path === "/") {
    return;
  }

  setAuthRedirect(path);
}

function getFlashNotice() {
  const flash = loadJson(STORAGE_KEYS.flash, null);
  if (!flash) {
    return null;
  }

  window.localStorage.removeItem(STORAGE_KEYS.flash);
  return flash;
}

function persistStore() {
  if (storeState.database) {
    saveJson(STORAGE_KEYS.database, storeState.database);
  }

  if (storeState.session) {
    saveJson(STORAGE_KEYS.session, storeState.session);
  }
}

function emit() {
  storeListeners.forEach((listener) => listener());
}

function subscribe(listener) {
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
}

function getSnapshot() {
  return storeState;
}

function initializeStore() {
  const database = loadJson(STORAGE_KEYS.database, null);
  const session = loadJson(STORAGE_KEYS.session, getEmptySession());

  if (!database || typeof database !== "object") {
    replaceStoreState({ database: buildDatabase() });
  } else {
    const normalized = normalizeDatabase(database);
    replaceStoreState({ database: normalized.database });
  }

  replaceStoreState({
    session: session && typeof session === "object" ? session : getEmptySession(),
    notice: getFlashNotice(),
    authRedirect: loadJson(STORAGE_KEYS.authRedirect, null)?.path || ""
  });

  ensureDemoAccount();
  persistStore();
}

function registerAccount(input) {
  const payload = {
    fullName: String(input.fullName || "").trim(),
    email: normalizeEmail(input.email),
    password: String(input.password || ""),
    confirmPassword: String(input.confirmPassword || ""),
    college: String(input.college || "").trim(),
    branch: normalizeBranch(input.branch),
    graduationYear: String(input.graduationYear || "").trim(),
    cgpa: normalizeCgpa(input.cgpa),
    activeBacklogs: normalizeInteger(input.activeBacklogs, 0),
    trackId: String(input.trackId || ""),
    targetRole: String(input.targetRole || "").trim(),
    placementType: normalizePlacementType(input.placementType),
    preferredLocations: normalizeStringArray(input.preferredLocations),
    weeklyFocus: String(input.weeklyFocus || "").trim(),
    bio: String(input.bio || "").trim()
  };

  validateRegistration(payload);

  let createdUser = null;

  updateDatabase((database) => {
    if (database.users.some((user) => user.email === payload.email)) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }

    createdUser = createUserRecord(database, payload);
  });

  if (createdUser) {
    setNotice("success", "Account created. Please sign in to open your workspace.");
    return { user: createdUser, redirectPath: "/login" };
  }

  return { user: null, redirectPath: "/login" };
}

function loginAccount(input) {
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  const passwordHash = hashPassword(password);
  const record = readDatabase().users.find((user) => user.email === email);

  if (!email) {
    throw new Error("Enter the email linked to your workspace.");
  }

  if (!password) {
    throw new Error("Enter your password.");
  }

  if (!record) {
    throw new Error("No account found for this email. Sign up first.");
  }

  if (record.passwordHash !== passwordHash) {
    throw new Error("The password is incorrect.");
  }

  writeSession(record);
  setNotice("success", "Welcome back.");
  return { user: record, redirectPath: getAuthRedirectOrDefault("/dashboard") };
}

function logout() {
  clearSession();
  setNotice("success", "Signed out successfully.");
  return { redirectPath: "/login" };
}

function updateProfile(input) {
  validateFilled(input.fullName, "Enter a full name.");
  validateTrack(input.trackId);

  updateCurrentUserRecord((database, userRow) => {
    const track = getCareerTrackById(input.trackId, database.careerTracks);

    userRow.fullName = String(input.fullName || "").trim();
    userRow.college = String(input.college || "").trim();
    userRow.branch = normalizeBranch(input.branch);
    userRow.graduationYear = String(input.graduationYear || "").trim();
    userRow.cgpa = normalizeCgpa(input.cgpa);
    userRow.activeBacklogs = normalizeInteger(input.activeBacklogs, 0);
    userRow.trackId = track.id;
    userRow.targetRole = String(input.targetRole || "").trim() || track.targetRoles[0];
    userRow.placementType = normalizePlacementType(input.placementType);
    userRow.preferredLocations = normalizeStringArray(input.preferredLocations);
    userRow.weeklyFocus = String(input.weeklyFocus || "").trim() || "Keep one real next action moving every day.";
    userRow.bio = String(input.bio || "").trim() || "Focused on campus placements and building proof for the roles that match this profile.";

    ensureUserSkillRows(database, userRow);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "profile.updated",
      entityType: "user",
      entityId: userRow.id,
      title: "Profile updated",
      meta: `${track.label} | ${userRow.targetRole}`
    });
  });

  setNotice("success", "Profile updated.");
}

function addApplication(input) {
  validateFilled(input.company, "Enter a company name.");
  validateFilled(input.title, "Enter a role title.");
  validateDateInput(input.deadline, "Choose a deadline.");

  updateCurrentUserRecord((database, userRow) => {
    const application = normalizeApplicationRow({
      userId: userRow.id,
      company: String(input.company || "").trim(),
      title: String(input.title || "").trim(),
      location: String(input.location || "").trim(),
      source: normalizeApplicationSource(input.source),
      jobUrl: String(input.jobUrl || "").trim(),
      salaryOrStipend: String(input.salaryOrStipend || "").trim(),
      deadline: input.deadline,
      stage: input.stage || "Applied",
      nextAction: String(input.nextAction || "").trim(),
      nextActionDueDate: input.nextActionDueDate,
      resumeVersion: String(input.resumeVersion || "").trim(),
      notes: String(input.notes || "").trim(),
      trackId: userRow.trackId,
      rounds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, userRow, database).row;

    database.applications.unshift(application);
    syncApplicationAutomation(database, userRow, application);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "application.created",
      entityType: "application",
      entityId: application.id,
      title: `${application.company} added to pipeline`,
      meta: `${application.title} | ${application.stage}`
    });
  });

  setNotice("success", "Application added to your pipeline.");
}

function addApplicationFromCatalog(jobId) {
  updateCurrentUserRecord((database, userRow) => {
    const job = findCatalogJob(jobId, database.jobsCatalog);
    if (!job) {
      throw new Error("This job could not be found.");
    }

    const duplicate = database.applications.some((application) => application.userId === userRow.id &&
      normalizeLookupKey(application.company, application.title) === normalizeLookupKey(job.company, job.title));

    if (duplicate) {
      throw new Error("This opening is already in your pipeline.");
    }

    const application = normalizeApplicationRow({
      userId: userRow.id,
      catalogJobId: job.id,
      company: job.company,
      title: job.title,
      location: job.location,
      source: job.source,
      jobUrl: job.jobUrl,
      salaryOrStipend: job.salaryOrStipend,
      deadline: job.deadline,
      stage: "Applied",
      nextAction: "Check application status and prepare role-specific examples",
      nextActionDueDate: addDays(new Date(), 2),
      resumeVersion: "",
      notes: job.summary,
      trackId: job.careerTrackId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, userRow, database).row;

    database.applications.unshift(application);
    syncApplicationAutomation(database, userRow, application);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "application.created",
      entityType: "application",
      entityId: application.id,
      title: `${job.company} added from recommendations`,
      meta: `${job.title} | ${application.eligibilityStatus}`
    });
  });

  setNotice("success", "Recommended opening added to your pipeline.");
}

function updateApplication(applicationId, input) {
  updateCurrentUserRecord((database, userRow) => {
    const application = findById(database.applications, applicationId);
    if (!application || application.userId !== userRow.id) {
      throw new Error("This application could not be found.");
    }

    const updated = normalizeApplicationRow({
      ...application,
      stage: input.stage ?? application.stage,
      nextAction: input.nextAction ?? application.nextAction,
      nextActionDueDate: input.nextActionDueDate ?? application.nextActionDueDate,
      resumeVersion: input.resumeVersion ?? application.resumeVersion,
      notes: input.notes ?? application.notes,
      jobUrl: input.jobUrl ?? application.jobUrl,
      salaryOrStipend: input.salaryOrStipend ?? application.salaryOrStipend
    }, userRow, database).row;

    Object.assign(application, updated, {
      updatedAt: new Date().toISOString()
    });

    syncApplicationAutomation(database, userRow, application);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "application.updated",
      entityType: "application",
      entityId: application.id,
      title: `${application.company} application updated`,
      meta: application.nextAction || application.stage
    });
  });

  setNotice("success", "Application updated.");
}

function updateApplicationStage(applicationId, nextStage) {
  if (!APP_CONFIG.applicationStages.some((stage) => stage.id === nextStage)) {
    throw new Error("Choose a valid application status.");
  }

  updateApplication(applicationId, { stage: nextStage });
}

function addApplicationRound(applicationId, input) {
  validateFilled(input.name, "Enter a round name.");
  validateDateInput(input.date, "Choose a round date.");

  updateCurrentUserRecord((database, userRow) => {
    const application = findById(database.applications, applicationId);
    if (!application || application.userId !== userRow.id) {
      throw new Error("This application could not be found.");
    }

    application.rounds.unshift(normalizeRoundRow({
      name: input.name,
      date: input.date,
      status: input.status,
      notes: input.notes
    }).row);
    application.updatedAt = new Date().toISOString();

    syncApplicationAutomation(database, userRow, application);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "round.created",
      entityType: "application",
      entityId: application.id,
      title: `${application.company}: ${input.name} added`,
      meta: `${normalizeRoundStatus(input.status)} | ${formatShortDate(input.date)}`
    });
  });

  setNotice("success", "Interview round added.");
}

function updateApplicationRound(applicationId, roundId, input) {
  updateCurrentUserRecord((database, userRow) => {
    const application = findById(database.applications, applicationId);
    if (!application || application.userId !== userRow.id) {
      throw new Error("This application could not be found.");
    }

    const round = application.rounds.find((item) => item.id === roundId);
    if (!round) {
      throw new Error("This round could not be found.");
    }

    const updated = normalizeRoundRow({
      ...round,
      name: input.name ?? round.name,
      date: input.date ?? round.date,
      status: input.status ?? round.status,
      notes: input.notes ?? round.notes
    }).row;

    Object.assign(round, updated);
    application.updatedAt = new Date().toISOString();

    syncApplicationAutomation(database, userRow, application);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "round.updated",
      entityType: "application",
      entityId: application.id,
      title: `${application.company}: ${round.name} updated`,
      meta: `${round.status} | ${formatShortDate(round.date)}`
    });
  });

  setNotice("success", "Interview round updated.");
}

function addPlannerTask(input) {
  validateFilled(input.title, "Enter a task title.");
  validateDateInput(input.dueDate, "Choose a due date.");

  updateCurrentUserRecord((database, userRow) => {
    const task = normalizePlannerTaskRow({
      userId: userRow.id,
      title: String(input.title || "").trim(),
      dueDate: input.dueDate,
      type: input.type || "Application",
      priority: input.priority || "Medium",
      applicationId: String(input.applicationId || ""),
      skillId: String(input.skillId || ""),
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).row;

    database.plannerTasks.unshift(task);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "task.created",
      entityType: "plannerTask",
      entityId: task.id,
      title: "Planner task added",
      meta: `${task.title} | ${task.priority} priority`
    });
  });

  setNotice("success", "Task added to your planner.");
}

function togglePlannerTask(taskId) {
  updateCurrentUserRecord((database, userRow) => {
    const task = findById(database.plannerTasks, taskId);
    if (!task || task.userId !== userRow.id) {
      throw new Error("This task could not be found.");
    }

    task.done = !task.done;
    task.updatedAt = new Date().toISOString();

    recordActivity(database, {
      userId: userRow.id,
      actionType: task.done ? "task.completed" : "task.reopened",
      entityType: "plannerTask",
      entityId: task.id,
      title: task.done ? "Task marked done" : "Task reopened",
      meta: task.title
    });
  });

  setNotice("success", "Planner task updated.");
}

function deletePlannerTask(taskId) {
  updateCurrentUserRecord((database, userRow) => {
    const task = findById(database.plannerTasks, taskId);
    if (!task || task.userId !== userRow.id) {
      throw new Error("This task could not be found.");
    }

    database.plannerTasks = database.plannerTasks.filter((item) => item.id !== taskId);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "task.deleted",
      entityType: "plannerTask",
      entityId: taskId,
      title: "Planner task removed",
      meta: task.title
    });
  });

  setNotice("success", "Task removed from your planner.");
}

function setSkillLevel(skillRowId, level) {
  updateCurrentUserRecord((database, userRow) => {
    const skillRow = findById(database.skills, skillRowId);
    if (!skillRow || skillRow.userId !== userRow.id) {
      throw new Error("This skill could not be found.");
    }

    skillRow.level = clampNumber(Number(level), 0, 100);
    skillRow.updatedAt = new Date().toISOString();

    recordActivity(database, {
      userId: userRow.id,
      actionType: "skill.assessed",
      entityType: "skill",
      entityId: skillRow.id,
      title: `${skillRow.label} self-assessed`,
      meta: `${skillRow.level}% current confidence`
    });
  });

  setNotice("success", "Skill level saved.");
}

function boostSkill(skillRowId) {
  updateCurrentUserRecord((database, userRow) => {
    const skillRow = findById(database.skills, skillRowId);
    if (!skillRow || skillRow.userId !== userRow.id) {
      throw new Error("This skill could not be found.");
    }

    skillRow.level = clampNumber(skillRow.level + 5, 0, 100);
    skillRow.updatedAt = new Date().toISOString();

    recordActivity(database, {
      userId: userRow.id,
      actionType: "skill.boosted",
      entityType: "skill",
      entityId: skillRow.id,
      title: `${skillRow.label} practice logged`,
      meta: `${skillRow.level}% current progress`
    });
  });

  setNotice("success", "Practice logged.");
}

function addProofItem(input) {
  validateFilled(input.title, "Enter a proof title.");
  validateDateInput(input.date, "Choose a date.");
  if (!REFERENCE_DATA.skillsCatalog.some((skill) => skill.id === input.skillId)) {
    throw new Error("Choose a related skill.");
  }

  const attachment = normalizeProofAttachment(input.attachment);
  if (input.attachment && !attachment) {
    throw new Error("Could not save the selected certificate file.");
  }

  if (attachment && attachment.fileSize > APP_CONFIG.maxProofAttachmentBytes) {
    throw new Error("Upload a certificate file smaller than 2 MB.");
  }

  updateCurrentUserRecord((database, userRow) => {
    const proofItem = normalizeProofItemRow({
      userId: userRow.id,
      type: input.type,
      title: String(input.title || "").trim(),
      source: String(input.source || "").trim(),
      url: String(input.url || "").trim(),
      attachment,
      skillId: input.skillId,
      date: input.date,
      notes: String(input.notes || "").trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).row;

    database.proofItems.unshift(proofItem);

    const skillRow = database.skills.find((item) => item.userId === userRow.id && item.skillId === proofItem.skillId);
    if (skillRow) {
      skillRow.level = clampNumber(skillRow.level + 4, 0, 100);
      skillRow.updatedAt = new Date().toISOString();
    }

    recordActivity(database, {
      userId: userRow.id,
      actionType: "proof.created",
      entityType: "proofItem",
      entityId: proofItem.id,
      title: `${proofItem.title} added`,
      meta: `${proofItem.type} | ${proofItem.source || "Proof"}`
    });
  });

  setNotice("success", "Proof item added.");
}

function resetWorkspace() {
  updateCurrentUserRecord((database, userRow) => {
    replaceUserWorkspace(database, userRow);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "workspace.reset",
      entityType: "workspace",
      entityId: userRow.id,
      title: "Workspace reset",
      meta: "Applications, tasks, proof, and activity were cleared."
    });
  });

  setNotice("success", "Workspace reset.");
}

function exportAccountBundle() {
  const database = readDatabase();
  const user = getSessionUserOrRedirect();

  return {
    schemaVersion: APP_CONFIG.version,
    exportedAt: new Date().toISOString(),
    user: sanitizeUserRecord(findById(database.users, user.id)),
    applications: listUserApplications(user.id, database),
    plannerTasks: listUserPlannerTasks(user.id, database),
    proofItems: listUserProofItems(user.id, database),
    skills: listUserSkills(user.id, database),
    activities: listUserActivities(user.id, database)
  };
}

function normalizeImportBundle(payload, currentUserRow, database) {
  const sourceUser = payload.user && typeof payload.user === "object" ? payload.user : payload;
  const nextTrack = getCareerTrackById(sourceUser.trackId || currentUserRow.trackId, database.careerTracks);
  const workspaceSource = payload.workspace && typeof payload.workspace === "object" ? payload.workspace : payload;
  const applicationsSource = Array.isArray(payload.applications) ? payload.applications : (workspaceSource.applications || []);
  const plannerSource = Array.isArray(payload.plannerTasks) ? payload.plannerTasks : (workspaceSource.plannerTasks || workspaceSource.planner || []);
  const proofSource = Array.isArray(payload.proofItems)
    ? payload.proofItems
    : (Array.isArray(payload.certifications) ? payload.certifications : (workspaceSource.proofItems || workspaceSource.certifications || []));
  const skillsSource = Array.isArray(payload.skills) ? payload.skills : (workspaceSource.skills || []);
  const activitiesSource = Array.isArray(payload.activities) ? payload.activities : [];

  const userShape = {
    fullName: String(sourceUser.fullName || currentUserRow.fullName).trim() || currentUserRow.fullName,
    college: String(sourceUser.college || currentUserRow.college).trim(),
    branch: normalizeBranch(sourceUser.branch || currentUserRow.branch),
    graduationYear: String(sourceUser.graduationYear || currentUserRow.graduationYear).trim(),
    cgpa: normalizeCgpa(sourceUser.cgpa ?? currentUserRow.cgpa),
    activeBacklogs: normalizeInteger(sourceUser.activeBacklogs ?? currentUserRow.activeBacklogs, 0),
    trackId: nextTrack.id,
    targetRole: String(sourceUser.targetRole || currentUserRow.targetRole).trim() || nextTrack.targetRoles[0],
    placementType: normalizePlacementType(sourceUser.placementType || currentUserRow.placementType),
    preferredLocations: normalizeStringArray(sourceUser.preferredLocations || currentUserRow.preferredLocations),
    weeklyFocus: String(sourceUser.weeklyFocus || currentUserRow.weeklyFocus).trim(),
    bio: String(sourceUser.bio || currentUserRow.bio).trim()
  };

  const applications = applicationsSource.map((item) => normalizeApplicationRow({
    ...item,
    userId: currentUserRow.id
  }, { ...currentUserRow, ...userShape }, database).row);

  const plannerTasks = plannerSource.map((item) => normalizePlannerTaskRow({
    ...item,
    userId: currentUserRow.id
  }).row);

  const proofItems = proofSource.map((item) => normalizeProofItemRow({
    ...item,
    userId: currentUserRow.id
  }).row);

  const skills = skillsSource.length
    ? skillsSource.map((item) => normalizeSkillRow({
        ...item,
        userId: currentUserRow.id
      }).row)
    : getTrackSkillIds(nextTrack.id, database.jobsCatalog, database.resourcesCatalog).map((skillId) => normalizeSkillRow({
        userId: currentUserRow.id,
        skillId,
        level: 0
      }).row);

  const activities = activitiesSource.map((item) => normalizeActivityRow({
    ...item,
    userId: currentUserRow.id
  }).row);

  return {
    userShape,
    importedData: {
      applications,
      plannerTasks,
      proofItems,
      skills,
      activities
    }
  };
}

function importAccount(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("The selected JSON file is not a valid account export.");
  }

  updateCurrentUserRecord((database, userRow) => {
    const normalized = normalizeImportBundle(payload, userRow, database);
    Object.assign(userRow, normalized.userShape);
    replaceUserWorkspace(database, userRow, normalized.importedData);
    recordActivity(database, {
      userId: userRow.id,
      actionType: "account.imported",
      entityType: "workspace",
      entityId: userRow.id,
      title: "Workspace imported",
      meta: "Profile and placement data were restored from a JSON export."
    });
  });

  setNotice("success", "Workspace imported.");
}

function getProfileCompleteness(user) {
  const fields = [
    { id: "college", label: "College", complete: Boolean(user.college) },
    { id: "branch", label: "Branch", complete: Boolean(user.branch) },
    { id: "graduationYear", label: "Graduation year", complete: Boolean(user.graduationYear) },
    { id: "cgpa", label: "CGPA", complete: typeof user.cgpa === "number" },
    { id: "targetRole", label: "Target role", complete: Boolean(user.targetRole) },
    { id: "placementType", label: "Placement type", complete: Boolean(user.placementType) }
  ];

  const completed = fields.filter((field) => field.complete).length;

  return {
    percent: Math.round((completed / fields.length) * 100),
    missingFields: fields.filter((field) => !field.complete).map((field) => field.label),
    eligibilityReady: isProfileEligibilityReady(user)
  };
}

function getEligibilityMissingFields(user) {
  return APP_CONFIG.profileRequiredFields.filter((field) => {
    if (field === "cgpa") {
      return typeof user.cgpa !== "number";
    }

    return !String(user[field] || "").trim();
  }).map((field) => {
    if (field === "graduationYear") {
      return "Graduation year";
    }

    return field.charAt(0).toUpperCase() + field.slice(1);
  });
}

function getProfileChecklist(user) {
  const completeness = getProfileCompleteness(user);
  const eligibilityMissingFields = getEligibilityMissingFields(user);
  const track = getCareerTrackById(user.trackId);
  const coreSkillIds = new Set(track.coreSkillIds);
  const assessedSkills = user.workspace.skills.filter((skill) => coreSkillIds.has(skill.skillId) && skill.level > 0);

  return [
    {
      id: "profile",
      title: "Complete eligibility profile",
      complete: completeness.eligibilityReady,
      copy: completeness.eligibilityReady
        ? "Branch, graduation year, and CGPA are present for job eligibility checks."
        : `Missing: ${eligibilityMissingFields.join(", ")}.`,
      href: "/account#profile-form"
    },
    {
      id: "skills",
      title: "Self-assess core skills",
      complete: assessedSkills.length >= Math.min(3, track.coreSkillIds.length),
      copy: assessedSkills.length
        ? `${assessedSkills.length} core skills already assessed.`
        : "Set starting skill levels so market gaps are meaningful.",
      href: "/growth#demand-skills"
    },
    {
      id: "application",
      title: "Add first real application",
      complete: user.workspace.applications.length > 0,
      copy: user.workspace.applications.length
        ? `${user.workspace.applications.length} application(s) already tracked.`
        : "Track one real role with deadline and next action to activate the operations view.",
      href: "/placements#placements-openings"
    }
  ];
}

function getEligibilityTone(status) {
  if (status === "Eligible") {
    return "success";
  }

  if (status === "Profile incomplete") {
    return "warning";
  }

  return "danger";
}

function getMatchBadgeTone(matchLabel) {
  if (matchLabel === "Strong fit") {
    return "success";
  }

  if (matchLabel === "Moderate fit") {
    return "accent";
  }

  return "neutral";
}

function getDeadlineBadgeTone(isoDate) {
  const difference = daysBetween(new Date(), new Date(isoDate));

  if (difference < 0) {
    return "danger";
  }

  if (difference <= 2) {
    return "warning";
  }

  return "accent";
}

function getPriorityBadgeTone(priority) {
  if (priority === "High") {
    return "warning";
  }

  if (priority === "Low") {
    return "muted";
  }

  return "accent";
}

function getStageBadgeTone(stage) {
  if (stage === "Offer") {
    return "success";
  }

  if (stage === "Interview" || stage === "Shortlisted") {
    return "accent";
  }

  if (stage === "Rejected") {
    return "danger";
  }

  return "neutral";
}

function buildSkillStrengthMap(user) {
  return new Map(user.workspace.skills.map((skill) => [skill.skillId, skill]));
}

function buildProofCoverageMap(user) {
  const coverage = new Map();

  user.workspace.proofItems.forEach((item) => {
    coverage.set(item.skillId, (coverage.get(item.skillId) || 0) + 1);
  });

  return coverage;
}

function buildUserJobEvalContext(user) {
  const targetRoleQuery = normalizeQuery(user.targetRole);
  return {
    skillMap: buildSkillStrengthMap(user),
    proofMap: buildProofCoverageMap(user),
    normalizedPreferredLocations: (user.preferredLocations || []).map((item) => normalizeQuery(item)),
    targetRoleQuery
  };
}

function evaluateJobForUser(user, job, context = null) {
  const derived = context || buildUserJobEvalContext(user);
  const skillMap = derived.skillMap;
  const proofMap = derived.proofMap;
  const eligibilityStatus = evaluateJobEligibility(user, job);

  const requiredMatches = job.requiredSkillIds.filter((skillId) => (skillMap.get(skillId)?.level || 0) >= 60);
  const preferredMatches = job.preferredSkillIds.filter((skillId) => (skillMap.get(skillId)?.level || 0) >= 60);
  const allMatchSkillIds = Array.from(new Set(job.requiredSkillIds.concat(job.preferredSkillIds)));
  const proofMatches = allMatchSkillIds.filter((skillId) => (proofMap.get(skillId) || 0) > 0);

  const requiredScore = job.requiredSkillIds.length
    ? Math.round((requiredMatches.length / job.requiredSkillIds.length) * 40)
    : 40;
  const preferredScore = job.preferredSkillIds.length
    ? Math.round((preferredMatches.length / job.preferredSkillIds.length) * 20)
    : 20;
  const proofScore = allMatchSkillIds.length
    ? Math.round((proofMatches.length / allMatchSkillIds.length) * 20)
    : 20;
  const normalizedJobTitle = normalizeQuery(job.title);
  const trackRoleScore = job.careerTrackId === user.trackId ||
    derived.targetRoleQuery.includes(normalizedJobTitle) ||
    normalizedJobTitle.includes(derived.targetRoleQuery)
    ? 10
    : 0;
  const normalizedJobLocation = normalizeQuery(job.location);
  const locationMatch = !derived.normalizedPreferredLocations.length || derived.normalizedPreferredLocations.some((item) =>
    normalizedJobLocation.includes(item) || item.includes(normalizedJobLocation)
  );
  const typeMatch = user.placementType === "either" || user.placementType === job.roleType;
  const preferenceScore = (locationMatch ? 5 : 0) + (typeMatch ? 5 : 0);

  const fitScore = clampNumber(requiredScore + preferredScore + proofScore + trackRoleScore + preferenceScore, 0, 100);
  let fitLabel = "Stretch";

  if (eligibilityStatus === "Eligible" && fitScore >= 75) {
    fitLabel = "Strong fit";
  } else if (eligibilityStatus !== "Not eligible" && fitScore >= 55) {
    fitLabel = "Moderate fit";
  }

  return {
    ...job,
    eligibilityStatus,
    fitScore,
    fitLabel,
    missingSkills: allMatchSkillIds.filter((skillId) => (skillMap.get(skillId)?.level || 0) < 60).map((skillId) => getSkillById(skillId).label),
    matchedRequiredSkills: requiredMatches.length,
    matchedPreferredSkills: preferredMatches.length,
    proofCoverage: proofMatches.length,
    totalMatchSkills: allMatchSkillIds.length
  };
}

function getRecommendedJobs(user, filters = {}) {
  const database = readDatabase();
  const context = buildUserJobEvalContext(user);
  const savedKeys = new Set(
    user.workspace.applications.map((application) => normalizeLookupKey(application.company, application.title))
  );
  const query = normalizeQuery(filters.query);
  const matchFilter = String(filters.matchFilter || "all");

  return database.jobsCatalog
    .map((job) => ({
      ...evaluateJobForUser(user, job, context),
      alreadySaved: savedKeys.has(normalizeLookupKey(job.company, job.title))
    }))
    .filter((job) => {
      if (query && !matchesSearch(job, query, ["company", "title", "location", "summary", "source"])) {
        return false;
      }

      if (matchFilter === "eligible") {
        return job.eligibilityStatus === "Eligible";
      }

      if (matchFilter === "strong") {
        return job.fitLabel === "Strong fit";
      }

      return true;
    })
    .sort((left, right) => {
      if (right.fitScore !== left.fitScore) {
        return right.fitScore - left.fitScore;
      }

      if (left.eligibilityStatus !== right.eligibilityStatus) {
        const rank = { Eligible: 0, "Profile incomplete": 1, "Not eligible": 2 };
        return rank[left.eligibilityStatus] - rank[right.eligibilityStatus];
      }

      return new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
    });
}

function getDemandSkills(user) {
  const database = readDatabase();
  const relevantJobs = database.jobsCatalog.filter((job) =>
    job.careerTrackId === user.trackId &&
    (user.placementType === "either" || user.placementType === job.roleType)
  );
  const jobs = relevantJobs.length
    ? relevantJobs
    : database.jobsCatalog.filter((job) => job.careerTrackId === user.trackId);
  const totalJobs = Math.max(1, jobs.length);
  const proofMap = buildProofCoverageMap(user);
  const skillMap = buildSkillStrengthMap(user);
  const demandMap = new Map();

  jobs.forEach((job) => {
    job.requiredSkillIds.forEach((skillId) => {
      const current = demandMap.get(skillId) || { requiredCount: 0, preferredCount: 0 };
      current.requiredCount += 1;
      demandMap.set(skillId, current);
    });

    job.preferredSkillIds.forEach((skillId) => {
      const current = demandMap.get(skillId) || { requiredCount: 0, preferredCount: 0 };
      current.preferredCount += 1;
      demandMap.set(skillId, current);
    });
  });

  return Array.from(demandMap.entries())
    .map(([skillId, counts]) => {
      const skillRow = skillMap.get(skillId);
      const demandRatio = (counts.requiredCount + counts.preferredCount) / totalJobs;
      const requiredRatio = counts.requiredCount / totalJobs;
      const level = skillRow?.level || 0;
      const proofCount = proofMap.get(skillId) || 0;
      let importance = "Monitor";

      if ((requiredRatio >= 0.5 || demandRatio >= 0.5) && (level < 60 || proofCount === 0)) {
        importance = "Critical";
      } else if (demandRatio >= 0.33 && level < 70) {
        importance = "Important";
      } else if (level >= 70 && demandRatio > 0) {
        importance = "Strength";
      }

      return {
        ...(skillRow || normalizeSkillRow({ userId: user.id, skillId, level: 0 }).row),
        demandCount: counts.requiredCount + counts.preferredCount,
        requiredCount: counts.requiredCount,
        preferredCount: counts.preferredCount,
        demandRatio,
        proofCount,
        importance
      };
    })
    .sort((left, right) => {
      if (right.demandCount !== left.demandCount) {
        return right.demandCount - left.demandCount;
      }

      return left.level - right.level;
    });
}

function getWeakSkillGaps(user) {
  return getDemandSkills(user).filter((skill) => skill.importance === "Critical" || skill.importance === "Important");
}

function getProofItemsBySkill(user) {
  const grouped = new Map();

  user.workspace.proofItems.forEach((item) => {
    const skill = getSkillById(item.skillId);
    const current = grouped.get(skill.id) || {
      skillId: skill.id,
      label: skill.label,
      items: []
    };

    current.items.push(item);
    grouped.set(skill.id, current);
  });

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      items: group.items.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function getRecommendedResources(user) {
  const database = readDatabase();
  const gapSkills = getWeakSkillGaps(user).map((skill) => skill.skillId);

  return clone(database.resourcesCatalog)
    .filter((resource) => resource.careerTrackIds.includes(user.trackId))
    .map((resource) => ({
      ...resource,
      overlap: resource.skillTags.filter((skillId) => gapSkills.includes(skillId)).length
    }))
    .sort((left, right) => {
      if (right.overlap !== left.overlap) {
        return right.overlap - left.overlap;
      }

      return left.title.localeCompare(right.title);
    });
}

function getRoleFitSummary(user) {
  const jobs = getRecommendedJobs(user, { matchFilter: "all" });
  const completeness = getProfileCompleteness(user);
  const strongFits = jobs.filter((job) => job.fitLabel === "Strong fit").length;
  const moderateFits = jobs.filter((job) => job.fitLabel === "Moderate fit").length;
  const blockers = jobs.filter((job) => job.eligibilityStatus !== "Eligible").length;

  return {
    completeness,
    strongFits,
    moderateFits,
    blockers,
    totalRelevantJobs: jobs.filter((job) => job.careerTrackId === user.trackId).length
  };
}

function getRecentActivity(user) {
  return clone(user.activities || []).slice(0, APP_CONFIG.activityLimit);
}

function getDashboardMetrics(user) {
  const activeApplications = user.workspace.applications.filter((item) => !["Offer", "Rejected"].includes(item.stage)).length;
  const upcomingRounds = user.workspace.applications.reduce((sum, application) => {
    return sum + application.rounds.filter((round) => round.status === "Scheduled" && hoursBetween(new Date(), new Date(round.date)) >= 0 && hoursBetween(new Date(), new Date(round.date)) <= 72).length;
  }, 0);
  const overdueActions = user.workspace.applications.filter((item) => item.nextActionDueDate && isPast(item.nextActionDueDate) && !["Offer", "Rejected"].includes(item.stage)).length;
  const offers = user.workspace.applications.filter((item) => item.stage === "Offer").length;

  return [
    {
      label: "Active applications",
      value: String(activeApplications),
      note: `${user.workspace.applications.length} total tracked`
    },
    {
      label: "Upcoming rounds",
      value: String(upcomingRounds),
      note: "Scheduled in the next 72 hours"
    },
    {
      label: "Overdue actions",
      value: String(overdueActions),
      note: "Follow-ups or decisions that need attention"
    },
    {
      label: "Offers",
      value: String(offers),
      note: `${user.workspace.proofItems.length} proof items saved`
    }
  ];
}

function getDashboardNextSteps(user) {
  const jobs = getRecommendedJobs(user, { matchFilter: "all" });
  const gaps = getWeakSkillGaps(user);
  const steps = [];

  const overdueApplication = clone(user.workspace.applications)
    .filter((application) => application.nextAction && application.nextActionDueDate && isPast(application.nextActionDueDate) && !["Offer", "Rejected"].includes(application.stage))
    .sort((left, right) => new Date(left.nextActionDueDate).getTime() - new Date(right.nextActionDueDate).getTime())[0];

  if (overdueApplication) {
    steps.push({
      kicker: "Overdue action",
      title: `${overdueApplication.company}: ${overdueApplication.nextAction}`,
      copy: `This follow-up is ${formatDueStatus(overdueApplication.nextActionDueDate)}. Review the related planning work before anything else.`,
      href: "/planner#planner-list",
      action: "Open planner",
      tone: "danger"
    });
  }

  const upcomingRound = clone(user.workspace.applications)
    .flatMap((application) => application.rounds
      .filter((round) => round.status === "Scheduled")
      .map((round) => ({
        application,
        round
      })))
    .filter((item) => hoursBetween(new Date(), new Date(item.round.date)) >= 0 && hoursBetween(new Date(), new Date(item.round.date)) <= 72)
    .sort((left, right) => new Date(left.round.date).getTime() - new Date(right.round.date).getTime())[0];

  if (upcomingRound) {
    steps.push({
      kicker: "Upcoming round",
      title: `${upcomingRound.application.company}: ${upcomingRound.round.name}`,
      copy: `${upcomingRound.round.status} ${formatDueStatus(upcomingRound.round.date)}. Review notes and linked prep tasks.`,
      href: "/planner#planner-list",
      action: "Open planner",
      tone: "warning"
    });
  }

  const upcomingDeadline = clone(user.workspace.applications)
    .filter((application) => !["Offer", "Rejected"].includes(application.stage))
    .filter((application) => daysBetween(new Date(), new Date(application.deadline)) >= 0 && daysBetween(new Date(), new Date(application.deadline)) <= 7)
    .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())[0];

  if (upcomingDeadline) {
    steps.push({
      kicker: "Deadline window",
      title: `Review ${upcomingDeadline.company}`,
      copy: `${upcomingDeadline.title} closes ${formatDueStatus(upcomingDeadline.deadline)}. Plan the next follow-up before the deadline slips.`,
      href: "/planner#planner-list",
      action: "Open planner",
      tone: getDeadlineBadgeTone(upcomingDeadline.deadline)
    });
  }

  const profileBlocker = jobs.find((job) => job.fitScore >= 75 && job.eligibilityStatus === "Profile incomplete");
  if (profileBlocker) {
    steps.push({
      kicker: "Eligibility blocker",
      title: `Unlock ${profileBlocker.company}`,
      copy: "Complete branch, graduation year, and CGPA so strong-fit jobs can be screened correctly.",
      href: "/account#profile-form",
      action: "Update profile",
      tone: "warning"
    });
  }

  const topGap = gaps[0];
  if (topGap) {
    steps.push({
      kicker: `${topGap.importance} gap`,
      title: `Strengthen ${topGap.label}`,
      copy: `This skill appears across ${topGap.demandCount} matching openings and your current level is ${topGap.level}%.`,
      href: "/growth",
      action: "Open growth",
      tone: topGap.importance === "Critical" ? "danger" : "warning"
    });
  }

  if (!steps.length) {
    steps.push({
      kicker: "Getting started",
      title: "Add your first application",
      copy: "Save one recommended opening to activate operations tracking, planner automation, and market-fit guidance.",
      href: "/placements#placements-openings",
      action: "Browse openings",
      tone: "accent"
    });
  }

  return steps.slice(0, 3);
}

function getPlannerItems(user) {
  return clone(user.workspace.planner).sort((left, right) => {
    if (left.done !== right.done) {
      return left.done ? 1 : -1;
    }

    const leftDate = new Date(left.dueDate).getTime();
    const rightDate = new Date(right.dueDate).getTime();
    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return getPriorityRank(left.priority) - getPriorityRank(right.priority);
  });
}

function getPipelineGroups(user, filters = {}) {
  const search = normalizeQuery(filters.query);
  const stageFilter = String(filters.stageFilter || "all");

  return APP_CONFIG.applicationStages.map((stageOption) => ({
    stage: stageOption.id,
    items: user.workspace.applications
      .filter((application) => {
        if (stageFilter !== "all" && application.stage !== stageFilter) {
          return false;
        }

        if (application.stage !== stageOption.id) {
          return false;
        }

        if (search && !matchesSearch(application, search, ["company", "title", "location", "source", "notes", "nextAction"])) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const leftKey = new Date(left.nextActionDueDate || left.deadline).getTime();
        const rightKey = new Date(right.nextActionDueDate || right.deadline).getTime();
        return leftKey - rightKey;
      })
  }));
}

function getAccountSummaryItems(user) {
  const completeness = getProfileCompleteness(user);
  return [
    {
      label: "Profile completeness",
      value: `${completeness.percent}%`,
      note: completeness.eligibilityReady ? "Eligibility-ready profile" : `Missing ${completeness.missingFields.length} key fields`
    },
    {
      label: "Applications",
      value: String(user.workspace.applications.length),
      note: `${user.workspace.applications.filter((item) => item.stage === "Offer").length} offers, ${user.workspace.applications.filter((item) => item.stage === "Interview").length} interview-stage`
    },
    {
      label: "Planner tasks",
      value: String(user.workspace.planner.length),
      note: `${user.workspace.planner.filter((item) => !item.done).length} currently open`
    },
    {
      label: "Proof items",
      value: String(user.workspace.proofItems.length),
      note: `${user.workspace.skills.filter((skill) => skill.level >= 60).length} skills above 60%`
    }
  ];
}

function useWorkspaceState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function handleStorage(event) {
  if (!event || event.key === STORAGE_KEYS.database) {
    replaceStoreState({ database: null });
  }

  if (!event || event.key === STORAGE_KEYS.session) {
    replaceStoreState({ session: null });
  }

  if (!event || event.key === STORAGE_KEYS.authRedirect) {
    replaceStoreState({ authRedirect: loadJson(STORAGE_KEYS.authRedirect, null)?.path || "" });
  }

  replaceStoreState({ notice: getFlashNotice() || storeState.notice });
  emit();
}

if (typeof window !== "undefined") {
  initializeStore();
  window.addEventListener("storage", handleStorage);
}

export {
  APP_CONFIG,
  REFERENCE_DATA,
  STORAGE_KEYS,
  addApplication,
  addApplicationFromCatalog,
  addApplicationRound,
  addPlannerTask,
  addProofItem,
  boostSkill,
  clearNotice,
  deletePlannerTask,
  exportAccountBundle,
  formatDate,
  formatDueStatus,
  formatShortDate,
  getAccountSummaryItems,
  getAuthRedirectOrDefault,
  getCareerTrackById,
  getDashboardMetrics,
  getDashboardNextSteps,
  getDeadlineBadgeTone,
  getDemandSkills,
  getEligibilityTone,
  getErrorMessage,
  getInitials,
  getMatchBadgeTone,
  getPipelineGroups,
  getPlannerItems,
  getPriorityBadgeTone,
  getProfileChecklist,
  getProfileCompleteness,
  getProofItemsBySkill,
  getRecentActivity,
  getRecommendedJobs,
  getRecommendedResources,
  getRoleFitSummary,
  getSessionUserOrRedirect,
  getSessionUserView,
  getSkillById,
  getSnapshot,
  getStageBadgeTone,
  getWeakSkillGaps,
  handleStorage,
  importAccount,
  isPast,
  loginAccount,
  logout,
  normalizeApplicationSource,
  normalizeApplicationStage,
  normalizePlannerCategory,
  normalizeTaskPriority,
  registerAccount,
  rememberAuthRedirect,
  resetWorkspace,
  setAuthRedirect,
  setNotice,
  setSkillLevel,
  subscribe,
  togglePlannerTask,
  updateApplication,
  updateApplicationRound,
  updateApplicationStage,
  updateProfile,
  useWorkspaceState
};
