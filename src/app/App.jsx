import React, { useEffect, useMemo, useState } from "react";
import * as workspace from "../state/workspace-store.js";
import { AppLink, useRouter } from "./router.jsx";

const WORKSPACE_ORDER = ["/dashboard", "/placements", "/planner", "/growth", "/account"];

const PAGE_TITLES = {
  "/": "JobHack Lite",
  "/login": "Sign In | JobHack Lite",
  "/signup": "Sign Up | JobHack Lite",
  "/dashboard": "Dashboard | JobHack Lite",
  "/placements": "Placements | JobHack Lite",
  "/planner": "Planner | JobHack Lite",
  "/growth": "Growth | JobHack Lite",
  "/account": "Account | JobHack Lite"
};

const PAGE_NAMES = {
  "/": "home",
  "/login": "login",
  "/signup": "signup",
  "/dashboard": "dashboard",
  "/placements": "placements",
  "/planner": "planner",
  "/growth": "growth",
  "/account": "account"
};

const SIGNUP_FALLBACK_HREF = "/?route=%2Fsignup";

function App() {
  const store = workspace.useWorkspaceState();
  const { route, hash, navigate } = useRouter();
  const user = workspace.getSessionUserView();
  const protectedRoute = WORKSPACE_ORDER.includes(route);
  const effectiveRoute = !user && protectedRoute
    ? "/login"
    : (route === "/signup" && user ? "/dashboard" : route);

  useEffect(() => {
    const routeName = PAGE_NAMES[effectiveRoute] || "home";
    document.body.dataset.page = routeName;
    document.body.dataset.protected = String(WORKSPACE_ORDER.includes(effectiveRoute));
    document.title = PAGE_TITLES[effectiveRoute] || "JobHack Lite";
  }, [effectiveRoute]);

  useEffect(() => {
    if (effectiveRoute === route) {
      return;
    }

    if (!user && protectedRoute) {
      workspace.rememberAuthRedirect(route + hash);
      workspace.setNotice("error", "Sign in to continue to your workspace.");
    }

    if (route === "/signup" && user) {
      workspace.setNotice("success", "Welcome back.");
    }

    navigate(effectiveRoute, { replace: true });
  }, [effectiveRoute, hash, navigate, protectedRoute, route, user]);

  const notice = store.notice;
  const sharedProps = {
    route: effectiveRoute,
    user,
    notice,
    navigate
  };

  if (effectiveRoute === "/") {
    return <HomePage {...sharedProps} />;
  }

  if (effectiveRoute === "/login") {
    return <LoginPage {...sharedProps} />;
  }

  if (effectiveRoute === "/signup") {
    return <SignupPage {...sharedProps} />;
  }

  if (effectiveRoute === "/dashboard") {
    return <DashboardPage {...sharedProps} />;
  }

  if (effectiveRoute === "/placements") {
    return <PlacementsPage {...sharedProps} />;
  }

  if (effectiveRoute === "/planner") {
    return <PlannerPage {...sharedProps} />;
  }

  if (effectiveRoute === "/growth") {
    return <GrowthPage {...sharedProps} />;
  }

  if (effectiveRoute === "/account") {
    return <AccountPage {...sharedProps} />;
  }

  return <HomePage {...sharedProps} />;
}

function NoticeBanner({ notice }) {
  if (!notice) {
    return null;
  }

  return (
    <div id="site-notice" className={`notice notice-${notice.type || "neutral"}`} aria-live="polite">
      <span>{notice.message}</span>
      <button className="notice-dismiss" type="button" onClick={() => workspace.clearNotice()}>
        Close
      </button>
    </div>
  );
}

function Brand({ inline = false, href = "/", className = "" }) {
  return (
    <AppLink className={`brand${inline ? " brand-inline" : ""}${className ? ` ${className}` : ""}`} to={href}>
      <span className="brand-mark">JH</span>
      <span>
        <strong>JobHack Lite</strong>
        <small>Placement workspace</small>
      </span>
    </AppLink>
  );
}

function StatusBadge({ tone = "neutral", children }) {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="section-heading">
      <div className="section-heading-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {copy ? <p className="form-note">{copy}</p> : null}
      </div>
      {action}
    </div>
  );
}

function MetricGrid({ items, id }) {
  return (
    <section id={id} className="metric-grid">
      {items.map((item) => (
        <article className="metric-card" key={`${item.label}-${item.value}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </article>
      ))}
    </section>
  );
}

function RouteCard({ kicker, title, copy, to }) {
  return (
    <AppLink className="route-card" to={to}>
      <span className="route-kicker">{kicker}</span>
      <strong>{title}</strong>
      <small>{copy}</small>
    </AppLink>
  );
}

function EmptyState({ title, copy, action }) {
  return (
    <div className="empty-state empty-state-action">
      <strong>{title}</strong>
      <span>{copy}</span>
      {action}
    </div>
  );
}

function FormError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  );
}

function PublicFeatureList({ items }) {
  return (
    <div className="auth-proof-grid">
      {items.map((item) => (
        <article className="auth-point" key={item.title}>
          <strong>{item.title}</strong>
          <span>{item.copy}</span>
        </article>
      ))}
    </div>
  );
}

function JobRecommendationsBoard({
  id = "job-recommendations",
  eyebrow = "Recommended jobs",
  title = "Openings aligned to your profile",
  copy = "Jobs are ranked by skill coverage, proof coverage, track fit, and eligibility. Save one when it should enter the pipeline.",
  action = null,
  jobs,
  query,
  matchFilter,
  onQueryChange,
  onMatchFilterChange,
  onClearFilters
}) {
  return (
    <article id={id} className="card">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        copy={copy}
        action={action}
      />
      <div className="stack-list">
        <div className="field-grid">
          <label className="field">
            <span>Search openings</span>
            <input
              id={`${id}-search`}
              type="text"
              placeholder="Search by company, role, or location"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Match filter</span>
            <select
              id={`${id}-match-filter`}
              value={matchFilter}
              onChange={(event) => onMatchFilterChange(event.target.value)}
            >
              {workspace.APP_CONFIG.jobMatchFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="stack-list">
          {jobs.length ? jobs.map((job) => (
            <article className="list-row" key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <p>{job.company} | {job.location} | {job.salaryOrStipend}</p>
                <p>{job.summary}</p>
                <small>Missing skills: {job.missingSkills.length ? job.missingSkills.join(", ") : "None"}</small>
              </div>
              <div className="list-meta">
                <div className="badge-row">
                  <StatusBadge tone={workspace.getMatchBadgeTone(job.fitLabel)}>{job.fitLabel}</StatusBadge>
                  <StatusBadge tone={workspace.getEligibilityTone(job.eligibilityStatus)}>{job.eligibilityStatus}</StatusBadge>
                  <StatusBadge tone={workspace.getDeadlineBadgeTone(job.deadline)}>Due {workspace.formatShortDate(job.deadline)}</StatusBadge>
                </div>
                <small>{job.source}</small>
                <div className="action-row">
                  {job.jobUrl ? (
                    <a className="ghost-button small" href={job.jobUrl} target="_blank" rel="noreferrer">
                      Apply link
                    </a>
                  ) : null}
                  <button
                    className="ghost-button small"
                    type="button"
                    disabled={job.alreadySaved}
                    onClick={() => {
                      try {
                        workspace.addApplicationFromCatalog(job.id);
                      } catch (err) {
                        workspace.setNotice("error", workspace.getErrorMessage(err));
                      }
                    }}
                  >
                    {job.alreadySaved ? "Saved" : "Add to pipeline"}
                  </button>
                </div>
              </div>
            </article>
          )) : (
            <EmptyState
              title="No openings match these filters."
              copy="Try a broader search or return to all openings before saving one to the pipeline."
              action={(
                <button
                  className="ghost-button small"
                  type="button"
                  onClick={onClearFilters}
                >
                  Clear filters
                </button>
              )}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function PublicShell({ route, user, notice, children }) {
  const isLogin = route === "/login";
  const isSignup = route === "/signup";

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="public-shell">
        <header className="public-header">
          <Brand inline href="/" />
          <nav className="public-nav" aria-label="Primary">
            <AppLink className={isLogin ? "is-current" : ""} data-public-auth to="/login">Sign in</AppLink>
            <AppLink
              className={isSignup ? "is-current" : ""}
              data-public-link="signup"
              href={SIGNUP_FALLBACK_HREF}
              to="/signup"
            >
              Sign up
            </AppLink>
          </nav>
        </header>
        <NoticeBanner notice={notice} />
        <main id="content" className="public-main">
          {children}
        </main>
      </div>
    </>
  );
}

function WorkspaceShell({ route, user, notice, navigate, children, pageLabel, pageTitle, summary, quickLinks }) {
  const currentIndex = WORKSPACE_ORDER.indexOf(route);

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="app-shell">
        <aside className="side-panel">
          <Brand href="/dashboard" />
          <nav className="side-nav" aria-label="Workspace">
            {WORKSPACE_ORDER.map((item, index) => (
              <AppLink
                key={item}
                data-private-link={PAGE_NAMES[item]}
                className={`side-link${route === item ? " is-current" : ""}${currentIndex > 0 && index < currentIndex ? " is-before" : ""}`}
                to={item}
              >
                <span>
                  <strong>{getRouteLabel(item)}</strong>
                  <small>{getRouteSummary(item)}</small>
                </span>
                <span className="side-index">{index + 1}</span>
              </AppLink>
            ))}
          </nav>
          <AppLink className="side-action-button" to="/growth#resource-recommendations">
            Prep resources
          </AppLink>
        </aside>

        <div className="workspace-shell">
          <header className="topbar">
            <div className="topbar-copy">
              <p className="eyebrow">{pageLabel}</p>
              <h1>{pageTitle}</h1>
              <p className="muted-copy">{summary}</p>
              <nav className="workspace-quick-nav" aria-label={`${pageTitle} shortcuts`}>
                {quickLinks}
              </nav>
            </div>
            <div className="account-chip">
              <span id="user-initials" className="account-avatar">{workspace.getInitials(user?.fullName || "JobHack User")}</span>
              <div className="account-chip-meta">
                <strong id="user-name">{user?.fullName || "Loading..."}</strong>
                <small id="user-email">{user?.email || "Loading..."}</small>
              </div>
              <button
                id="logout-button"
                className="ghost-button"
                type="button"
                onClick={() => {
                  const result = workspace.logout();
                  navigate(result.redirectPath, { replace: true });
                }}
              >
                Logout
              </button>
            </div>
          </header>

          <NoticeBanner notice={notice} />
          <main id="content" className="workspace-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

function getRouteLabel(route) {
  switch (route) {
    case "/dashboard":
      return "Dashboard";
    case "/placements":
      return "Placements";
    case "/planner":
      return "Planner";
    case "/growth":
      return "Growth";
    case "/account":
      return "Account";
    default:
      return "Home";
  }
}

function getRouteSummary(route) {
  switch (route) {
    case "/dashboard":
      return "Daily placement view";
    case "/placements":
      return "Openings, tracks, and prep";
    case "/planner":
      return "Tasks, rounds, and follow-ups";
    case "/growth":
      return "Skill gaps and proof";
    case "/account":
      return "Eligibility profile and exports";
    default:
      return "";
  }
}

function buildSignupForm(defaultTrack) {
  return {
    fullName: "",
    college: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    activeBacklogs: "0",
    email: "",
    password: "",
    confirmPassword: "",
    trackId: defaultTrack.id,
    targetRole: defaultTrack.targetRoles[0],
    placementType: "either",
    preferredLocations: "",
    weeklyFocus: "",
    bio: ""
  };
}

function buildProfileForm(user) {
  return {
    fullName: user.fullName || "",
    college: user.college || "",
    branch: user.branch || "",
    graduationYear: user.graduationYear || "",
    cgpa: user.cgpa ?? "",
    activeBacklogs: user.activeBacklogs ?? 0,
    trackId: user.trackId,
    targetRole: user.targetRole || "",
    placementType: user.placementType || "either",
    preferredLocations: (user.preferredLocations || []).join(", "),
    weeklyFocus: user.weeklyFocus || "",
    bio: user.bio || ""
  };
}

const PROOF_ATTACHMENT_ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp";

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function buildProofAttachment(file) {
  if (!file || !file.name) {
    return null;
  }

  const maxBytes = workspace.APP_CONFIG.maxProofAttachmentBytes || (2 * 1024 * 1024);
  if (file.size > maxBytes) {
    throw new Error(`Upload a certificate file smaller than ${formatFileSize(maxBytes)}.`);
  }

  return {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
    dataUrl: await readFileAsDataUrl(file)
  };
}

function LoginPage({ route, user, notice, navigate }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  return (
    <PublicShell route={route} user={user} notice={notice}>
      <section className="auth-shell">
        <article className="auth-copy card">
          <p className="eyebrow">Sign in</p>
          <h1>Return to your placement operations workspace.</h1>
          <p className="muted-copy">
            Reopen your application pipeline, upcoming rounds, market-fit guidance, and profile details from the same local-first workspace.
          </p>
          <PublicFeatureList
            items={[
              {
                title: "Eligibility checks",
                copy: "See which jobs are open, blocked by missing profile data, or not worth chasing."
              },
              {
                title: "Daily operations",
                copy: "Track next actions, interview rounds, and follow-ups without spreading them across notes."
              },
              {
                title: "Skill proof",
                copy: "Keep projects, certificates, coding practice, and mock interviews tied to real demand."
              }
            ]}
          />
          <div className="demo-card">
            <span className="feature-kicker">Local-first</span>
            <strong>Your data stays on this device.</strong>
            <span>Use export and import later if you want a portable backup of the workspace.</span>
          </div>
        </article>

        <article className="card auth-form-card">
          <div className="auth-form-head">
            <p className="eyebrow">Workspace access</p>
            <h2>Open your saved workspace</h2>
            <p className="form-note">Sign in with the account you created on this device.</p>
          </div>
          <form
            id="login-form"
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");

              try {
                const result = workspace.loginAccount(form);
                navigate(result.redirectPath, { replace: true });
              } catch (err) {
                const message = workspace.getErrorMessage(err);
                setError(message);
                workspace.setNotice("error", message);
              }
            }}
          >
            <label className="field">
              <span>Email</span>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="student@example.com"
                autoComplete="username"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                minLength={6}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            <FormError message={error} />
            <button id="login-submit" className="primary-button" type="submit">
              Open workspace
            </button>
          </form>
          <p className="auth-form-foot">
            Need a new workspace? <AppLink href={SIGNUP_FALLBACK_HREF} to="/signup">Create one from your eligibility profile</AppLink>.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}

function SignupPage({ route, user, notice, navigate }) {
  const { database } = workspace.useWorkspaceState();
  const defaultTrack = database.careerTracks[0];
  const [roleTouched, setRoleTouched] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => buildSignupForm(defaultTrack));

  useEffect(() => {
    const track = workspace.getCareerTrackById(form.trackId, database.careerTracks);
    if (!roleTouched) {
      setForm((current) => ({
        ...current,
        targetRole: track.targetRoles[0]
      }));
    }
  }, [database.careerTracks, form.trackId, roleTouched]);

  return (
    <PublicShell route={route} user={user} notice={notice}>
      <section className="auth-shell">
        <article className="auth-copy card">
          <p className="eyebrow">Sign up</p>
          <h1>Build a practical campus placement workspace.</h1>
          <p className="muted-copy">
            Start with eligibility data, choose your target track, and open an empty workspace that is ready for real applications instead of demo filler.
          </p>
          <PublicFeatureList
            items={[
              {
                title: "Eligibility profile",
                copy: "Save branch, graduation year, CGPA, and backlog status so job checks are useful."
              },
              {
                title: "Operations-first tracking",
                copy: "Add applications, next actions, interview rounds, and resume versions in one place."
              },
              {
                title: "Market skill gaps",
                copy: "See which in-demand skills still need stronger proof for your target role."
              }
            ]}
          />
          <div className="demo-card">
            <span className="feature-kicker">What happens next</span>
            <strong>No fake data will be added.</strong>
            <span>You will start with an empty workspace plus guided setup steps for profile, skills, and first application.</span>
          </div>
        </article>

        <article className="card auth-form-card">
          <div className="auth-form-head">
            <p className="eyebrow">New workspace</p>
            <h2>Create workspace</h2>
            <p className="form-note">Add the profile details that affect eligibility, job matching, and growth guidance.</p>
          </div>
          <form
            id="signup-form"
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");

              try {
                const result = workspace.registerAccount(form);
                navigate(result.redirectPath, { replace: true });
              } catch (err) {
                const message = workspace.getErrorMessage(err);
                setError(message);
                workspace.setNotice("error", message);
              }
            }}
          >
            <div className="field-grid">
              <label className="field">
                <span>Full name</span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>College</span>
                <input
                  name="college"
                  type="text"
                  placeholder="Your college"
                  autoComplete="organization"
                  value={form.college}
                  onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Branch</span>
                <input
                  name="branch"
                  type="text"
                  placeholder="CSE"
                  value={form.branch}
                  onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Graduation year</span>
                <input
                  name="graduationYear"
                  type="text"
                  placeholder="2027"
                  value={form.graduationYear}
                  onChange={(event) => setForm((current) => ({ ...current, graduationYear: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>CGPA</span>
                <input
                  name="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="8.2"
                  value={form.cgpa}
                  onChange={(event) => setForm((current) => ({ ...current, cgpa: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Active backlogs</span>
                <input
                  name="activeBacklogs"
                  type="number"
                  min="0"
                  step="1"
                  value={form.activeBacklogs}
                  onChange={(event) => setForm((current) => ({ ...current, activeBacklogs: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
            </div>
            <label className="field">
              <span>Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              />
            </label>
            <div className="field-grid">
              <label className="field">
                <span>Career path</span>
                <select
                  id="signup-track"
                  name="trackId"
                  required
                  value={form.trackId}
                  onChange={(event) => {
                    const nextTrackId = event.target.value;
                    const nextTrack = workspace.getCareerTrackById(nextTrackId, database.careerTracks);
                    setForm((current) => ({
                      ...current,
                      trackId: nextTrackId,
                      targetRole: roleTouched ? current.targetRole : nextTrack.targetRoles[0]
                    }));
                  }}
                >
                  {database.careerTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Target role</span>
                <input
                  id="signup-role"
                  name="targetRole"
                  type="text"
                  placeholder="Frontend Developer"
                  autoComplete="organization-title"
                  value={form.targetRole}
                  onChange={(event) => {
                    setRoleTouched(true);
                    setForm((current) => ({ ...current, targetRole: event.target.value }));
                  }}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Placement type</span>
                <select
                  name="placementType"
                  value={form.placementType}
                  onChange={(event) => setForm((current) => ({ ...current, placementType: event.target.value }))}
                >
                  {workspace.APP_CONFIG.placementTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preferred locations</span>
                <input
                  name="preferredLocations"
                  type="text"
                  placeholder="Remote, Bengaluru, Hyderabad"
                  value={form.preferredLocations}
                  onChange={(event) => setForm((current) => ({ ...current, preferredLocations: event.target.value }))}
                />
              </label>
            </div>
            <label className="field">
              <span>This week's focus</span>
              <input
                name="weeklyFocus"
                type="text"
                placeholder="Apply to two eligible roles and prepare for one round"
                value={form.weeklyFocus}
                onChange={(event) => setForm((current) => ({ ...current, weeklyFocus: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>About you</span>
              <textarea
                name="bio"
                rows="4"
                placeholder="Share your target roles, current strengths, and placement goals."
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </label>
            <FormError message={error} />
            <button id="signup-submit" className="primary-button" type="submit">
              Create account
            </button>
          </form>
          <p className="auth-form-foot">
            Already have a workspace? <AppLink to="/login">Sign in</AppLink>.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}

function HomePage({ route, user, notice }) {
  const { database } = workspace.useWorkspaceState();

  return (
    <PublicShell route={route} user={user} notice={notice}>
      <section className="hero-card hero-card-wide">
        <div className="hero-copy">
          <p className="eyebrow">Campus placement workflow</p>
          <h1>Practical support for placement process and skill growth.</h1>
          <p className="hero-summary">
            Start with eligibility data, track every application with a real next action, and close the skill gaps that show up across your target job market.
          </p>
          <div className="hero-stats" aria-label="Placement workflow highlights">
            <article className="hero-stat">
              <strong>Eligibility-first</strong>
              <span>Know whether a role is open, blocked by missing profile data, or not worth chasing.</span>
            </article>
            <article className="hero-stat">
              <strong>Operations in one view</strong>
              <span>Track deadlines, next actions, resume versions, and interview rounds without scattered notes.</span>
            </article>
            <article className="hero-stat">
              <strong>Market-aligned growth</strong>
              <span>Prioritize skills and proof based on what matching roles are repeatedly asking for.</span>
            </article>
          </div>
        </div>
        <div className="hero-stack">
          <article className="feature-panel">
            <span className="feature-kicker">Profile</span>
            <strong>Eligibility data that changes decisions</strong>
            <p>Branch, graduation year, CGPA, backlogs, role type, and preferred locations all shape the recommendation engine.</p>
          </article>
          <article className="feature-panel feature-panel-soft">
            <span className="feature-kicker">Pipeline</span>
            <strong>Applications with real operations</strong>
            <p>Each role can carry its own next action, due date, resume version, notes, and round history.</p>
          </article>
          <article className="feature-panel">
            <span className="feature-kicker">Growth</span>
            <strong>Proof attached to demand-heavy skills</strong>
            <p>Projects, certificates, coding practice, and mock interviews stay connected to the skills employers care about.</p>
          </article>
          <div className="logo-row" aria-label="Placement themes">
            <span>Eligibility checks</span>
            <span>Interview rounds</span>
            <span>Skill proof</span>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div>
          <p className="eyebrow">Workflow map</p>
          <h2>Built for the actual placement cycle.</h2>
        </div>
        <p className="proof-copy">
          The product flow starts with profile eligibility, moves into application operations, then helps you close market-relevant gaps with proof of progress.
        </p>
      </section>

      <section className="section-grid">
        <article className="card">
          <p className="eyebrow">Core workflow</p>
          <h2>What the workspace helps you do</h2>
          <ul className="bullet-list">
            <li>Check whether a job fits your profile before spending time on it</li>
            <li>Track each application with a real next action and due date</li>
            <li>Prepare for rounds using linked tasks instead of scattered reminders</li>
            <li>Find the weakest skills that show up repeatedly across matching roles</li>
            <li>Attach proof to the skills you are improving</li>
          </ul>
        </article>
        <article className="card">
          <p className="eyebrow">Career tracks</p>
          <h2>Pick the path you are targeting</h2>
          <div className="chip-row">
            {database.careerTracks.map((track) => (
              <span className="chip" key={track.id}>{track.label}</span>
            ))}
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">Why it stays practical</p>
          <h2>Designed to support daily placement decisions</h2>
          <div className="stack-list">
            {workspace.REFERENCE_DATA.homeSignals.map((signal) => (
              <p key={signal}>{signal}</p>
            ))}
          </div>
        </article>
      </section>
    </PublicShell>
  );
}

function DashboardPage({ route, user, notice, navigate }) {
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");

  const metrics = useMemo(() => workspace.getDashboardMetrics(user), [user]);
  const nextSteps = useMemo(() => workspace.getDashboardNextSteps(user), [user]);
  const jobs = useMemo(
    () => workspace.getRecommendedJobs(user, { query, matchFilter }).slice(0, 6),
    [user, query, matchFilter]
  );
  const checklist = useMemo(() => workspace.getProfileChecklist(user), [user]);
  const incompleteChecklist = checklist.some((item) => !item.complete);

  return (
    <WorkspaceShell
      route={route}
      user={user}
      notice={notice}
      navigate={navigate}
      pageLabel="Placement overview"
      pageTitle="Dashboard"
      summary="Eligibility, active applications, urgent follow-ups, and market-fit signals are visible in one place."
      quickLinks={[
        <AppLink key="jobs" to="/dashboard#job-recommendations">Recommended jobs</AppLink>,
        <AppLink key="actions" to="/dashboard#today-next-step">Next actions</AppLink>,
        <AppLink key="placements" to="/placements#placements-openings">Browse placements</AppLink>,
        <AppLink key="plan" to="/planner">Open planner</AppLink>,
        <AppLink key="grow" to="/growth">Review growth</AppLink>
      ]}
    >
      {incompleteChecklist ? (
        <section className="card" aria-labelledby="setup-checklist-title">
          <SectionHeading
            eyebrow="Guided start"
            title="First-run checklist"
            copy="Finish these steps to turn the workspace into something actionable."
          />
          <div id="setup-checklist" className="stack-list">
            {checklist.map((item) => (
              <article className="list-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone={item.complete ? "success" : "warning"}>{item.complete ? "Done" : "Pending"}</StatusBadge>
                  <AppLink className="ghost-button small" to={item.href}>Open</AppLink>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card action-guide-card" aria-labelledby="today-next-step-title">
        <SectionHeading
          eyebrow="Priority queue"
          title="Today's next actions"
          copy="Items are ordered by overdue follow-ups, upcoming rounds, near deadlines, profile blockers, and high-demand weak skills."
        />
        <div id="today-next-step" className="today-action-grid">
          {nextSteps.map((step) => (
            <AppLink className="today-action-card" to={step.href} key={`${step.title}-${step.kicker}`}>
              <div className="today-action-head">
                <StatusBadge tone={step.tone}>{step.kicker}</StatusBadge>
                <span className="action-card-link">{step.action}</span>
              </div>
              <strong>{step.title}</strong>
              <p>{step.copy}</p>
            </AppLink>
          ))}
        </div>
      </section>

      <MetricGrid id="metrics-grid" items={metrics} />

      <JobRecommendationsBoard
        id="job-recommendations"
        jobs={jobs}
        query={query}
        matchFilter={matchFilter}
        onQueryChange={setQuery}
        onMatchFilterChange={(value) => setMatchFilter(value)}
        onClearFilters={() => {
          setQuery("");
          setMatchFilter("all");
        }}
        action={<AppLink className="text-link" to="/growth">Improve fit</AppLink>}
      />

      <section className="next-actions" aria-label="Recommended next steps">
        <RouteCard
          kicker="Primary"
          title="Run placement operations"
          copy="Move from the overview into detailed tasks, rounds, and application updates."
          to="/planner"
        />
        <RouteCard
          kicker="Secondary"
          title="Close visible skill gaps"
          copy="Review demand-heavy skills, save proof, and improve fit against matching roles."
          to="/growth"
        />
      </section>
    </WorkspaceShell>
  );
}

function PlacementsPage({ route, user, notice, navigate }) {
  const { database } = workspace.useWorkspaceState();
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");

  const allJobs = useMemo(
    () => workspace.getRecommendedJobs(user, { query: "", matchFilter: "all" }),
    [user]
  );
  const jobs = useMemo(
    () => workspace.getRecommendedJobs(user, { query, matchFilter }),
    [user, query, matchFilter]
  );
  const currentTrack = useMemo(
    () => workspace.getCareerTrackById(user.trackId, database.careerTracks),
    [user.trackId, database.careerTracks]
  );
  const metrics = [
    {
      label: "Catalog openings",
      value: String(database.jobsCatalog.length),
      note: "Reference roles in the placement catalog"
    },
    {
      label: "Strong fit",
      value: String(allJobs.filter((job) => job.fitLabel === "Strong fit").length),
      note: "Openings with stronger current skill coverage"
    },
    {
      label: "Eligible now",
      value: String(allJobs.filter((job) => job.eligibilityStatus === "Eligible").length),
      note: "Roles your current profile can apply to"
    },
    {
      label: "Current track",
      value: currentTrack.label,
      note: user.targetRole || currentTrack.targetRoles[0]
    }
  ];

  return (
    <WorkspaceShell
      route={route}
      user={user}
      notice={notice}
      navigate={navigate}
      pageLabel="Placement catalog"
      pageTitle="Placements"
      summary="Browse opening data, compare track fit, and move promising roles into your dashboard pipeline."
      quickLinks={[
        <AppLink key="tracks" to="/placements#placements-tracks">Career tracks</AppLink>,
        <AppLink key="openings" to="/placements#placements-openings">Openings</AppLink>,
        <AppLink key="dashboard" to="/dashboard">Dashboard</AppLink>
      ]}
    >
      <MetricGrid id="placements-metrics" items={metrics} />

      <section id="placements-tracks" className="content-grid">
        {database.careerTracks.map((track) => (
          <article className="card" key={track.id}>
            <SectionHeading
              eyebrow={track.id === user.trackId ? "Current track" : "Career track"}
              title={track.label}
              copy={`Target roles: ${track.targetRoles.join(", ")}`}
            />
            <div className="badge-row">
              {track.coreSkillIds.map((skillId) => (
                <StatusBadge key={skillId} tone={track.id === user.trackId ? "success" : "neutral"}>
                  {workspace.getSkillById(skillId).label}
                </StatusBadge>
              ))}
            </div>
            <div className="stack-list">
              {track.roadmap.map((step) => (
                <article className="list-row" key={step.title}>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </section>

      <JobRecommendationsBoard
        id="placements-openings"
        eyebrow="Placement openings"
        title="Browse openings by fit and eligibility"
        copy="This routed view exposes the placement catalog directly, with the same matching logic used on the dashboard."
        jobs={jobs}
        query={query}
        matchFilter={matchFilter}
        onQueryChange={setQuery}
        onMatchFilterChange={setMatchFilter}
        onClearFilters={() => {
          setQuery("");
          setMatchFilter("all");
        }}
      />

      <section className="next-actions" aria-label="Recommended next steps">
        <RouteCard
          kicker="Primary"
          title="Return to the dashboard"
          copy="Use the routed placement view to shortlist roles, then track them in the main operations dashboard."
          to="/dashboard"
        />
        <RouteCard
          kicker="Secondary"
          title="Improve weak-fit skills"
          copy="Switch to Growth to add proof and close the gaps highlighted by the placement catalog."
          to="/growth"
        />
      </section>
    </WorkspaceShell>
  );
}

function PlannerPage({ route, user, notice, navigate }) {
  const [error, setError] = useState("");
  const plannerItems = workspace.getPlannerItems(user);
  const skillOptions = user.workspace.skills;

  return (
    <WorkspaceShell
      route={route}
      user={user}
      notice={notice}
      navigate={navigate}
      pageLabel="Placement operations"
      pageTitle="Planner"
      summary="Tasks, deadlines, rounds, and follow-up actions stay linked to the applications that created them."
      quickLinks={[
        <AppLink key="add-task" to="/planner#planner-form">Add task</AppLink>
      ]}
    >
      <section className="content-grid">
        <article className="card">
          <SectionHeading
            eyebrow="Add task"
            title="Create an operational task"
            copy="Use this for aptitude practice, interview prep, document follow-ups, or anything not already created automatically by an application."
          />
          <form
            id="planner-form"
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              const data = Object.fromEntries(new FormData(event.currentTarget).entries());

              try {
                workspace.addPlannerTask({
                  title: data.title,
                  dueDate: data.dueDate,
                  type: data.type,
                  priority: data.priority,
                  applicationId: data.applicationId,
                  skillId: data.skillId
                });
                event.currentTarget.reset();
              } catch (err) {
                const message = workspace.getErrorMessage(err);
                setError(message);
                workspace.setNotice("error", message);
              }
            }}
          >
            <label className="field">
              <span>Task title</span>
              <input name="title" type="text" placeholder="Practice aptitude set for upcoming round" required />
            </label>
            <div className="field-grid">
              <label className="field">
                <span>Due date</span>
                <input name="dueDate" type="date" required />
              </label>
              <label className="field">
                <span>Task type</span>
                <select name="type" defaultValue="Application">
                  {workspace.APP_CONFIG.plannerCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Priority</span>
                <select name="priority" defaultValue="Medium">
                  {workspace.APP_CONFIG.taskPriorities.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Link to application</span>
                <select name="applicationId" defaultValue="">
                  <option value="">No linked application</option>
                  {user.workspace.applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.company} | {application.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Link to skill</span>
              <select name="skillId" defaultValue="">
                <option value="">No linked skill</option>
                {skillOptions.map((skill) => (
                  <option key={skill.id} value={skill.skillId}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </label>
            <FormError message={error} />
            <button className="primary-button" type="submit">
              Add task to planner
            </button>
          </form>
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Task list"
            title="Upcoming work"
            copy="Open items are sorted by due date and priority. Linked tasks inherit context from the related application or skill."
          />
          <div id="planner-list" className="stack-list">
            {plannerItems.length ? plannerItems.map((item) => {
              const linkedApplication = user.workspace.applications.find((application) => application.id === item.applicationId);
              const linkedSkill = user.workspace.skills.find((skill) => skill.skillId === item.skillId);

              return (
                <article className="list-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>Due {workspace.formatDueStatus(item.dueDate)} | {workspace.formatDate(item.dueDate)}</p>
                    <div className="badge-row">
                      <StatusBadge tone="neutral">{item.type}</StatusBadge>
                      <StatusBadge tone={workspace.getPriorityBadgeTone(item.priority)}>{item.priority} priority</StatusBadge>
                      <StatusBadge tone={item.done ? "success" : workspace.getDeadlineBadgeTone(item.dueDate)}>{item.done ? "Done" : "Open"}</StatusBadge>
                    </div>
                    {linkedApplication ? <small>{linkedApplication.company} | {linkedApplication.title}</small> : null}
                    {!linkedApplication && linkedSkill ? <small>{linkedSkill.label}</small> : null}
                  </div>
                  <div className="action-row">
                    <button
                      className="ghost-button small"
                      type="button"
                      onClick={() => {
                        try {
                          workspace.togglePlannerTask(item.id);
                        } catch (err) {
                          workspace.setNotice("error", workspace.getErrorMessage(err));
                        }
                      }}
                    >
                      {item.done ? "Mark open" : "Mark done"}
                    </button>
                    <button
                      className="ghost-button small"
                      type="button"
                      onClick={() => {
                        try {
                          workspace.deletePlannerTask(item.id);
                        } catch (err) {
                          workspace.setNotice("error", workspace.getErrorMessage(err));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            }) : (
              <EmptyState
                title="No planner items yet."
                copy="Add one concrete task or create an application with a next-action due date so the operations board starts working."
                action={<AppLink className="ghost-button small" to="/planner#planner-form">Add first task</AppLink>}
              />
            )}
          </div>
        </article>
      </section>
    </WorkspaceShell>
  );
}

function GrowthPage({ route, user, notice, navigate }) {
  const { database } = workspace.useWorkspaceState();
  const [error, setError] = useState("");
  const roleSummary = useMemo(() => workspace.getRoleFitSummary(user), [user]);
  const demandSkills = useMemo(() => workspace.getDemandSkills(user).slice(0, 4), [user]);
  const weakSkills = useMemo(() => workspace.getWeakSkillGaps(user), [user]);
  const resources = useMemo(() => workspace.getRecommendedResources(user), [user]);
  const skillOptions = user.workspace.skills;

  const summaryItems = [
    {
      label: "Strong fits",
      value: String(roleSummary.strongFits),
      note: "Eligible roles with high coverage"
    },
    {
      label: "Moderate fits",
      value: String(roleSummary.moderateFits),
      note: "Roles that need stronger coverage or profile data"
    },
    {
      label: "Profile completeness",
      value: `${roleSummary.completeness.percent}%`,
      note: roleSummary.completeness.eligibilityReady ? "Ready for eligibility checks" : "Complete missing eligibility fields"
    },
    {
      label: "Proof items",
      value: String(user.workspace.proofItems.length),
      note: "Projects, certificates, practice, and mock interviews"
    }
  ];

  return (
    <WorkspaceShell
      route={route}
      user={user}
      notice={notice}
      navigate={navigate}
      pageLabel="Skill and proof workflow"
      pageTitle="Growth"
      summary="Close the skill gaps that keep showing up in matching jobs and attach proof to the skills you want employers to trust."
      quickLinks={[
        <AppLink key="proof" to="/growth#proof-form">Add certificate</AppLink>,
        <AppLink key="resources" to="/growth#resource-recommendations">Resources</AppLink>
      ]}
    >
      <MetricGrid id="role-fit-summary" items={summaryItems} />

      <section className="content-grid">
        <article className="card">
          <SectionHeading
            eyebrow="Add certificate"
            title="Add certificate"
            copy="Save certificates, projects, coding practice, or mock interviews and review them in the same section."
          />
          <form
            id="proof-form"
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              const formElement = event.currentTarget;
              const data = Object.fromEntries(new FormData(formElement).entries());
              const fileInput = formElement.querySelector('input[name="attachment"]');
              const attachmentFile = fileInput?.files?.[0] || null;

              try {
                const attachment = await buildProofAttachment(attachmentFile);
                workspace.addProofItem({
                  type: data.type,
                  title: data.title,
                  source: data.source,
                  url: data.url,
                  attachment,
                  skillId: data.skillId,
                  date: data.date,
                  notes: data.notes
                });
                formElement.reset();
              } catch (err) {
                const message = workspace.getErrorMessage(err);
                setError(message);
                workspace.setNotice("error", message);
              }
            }}
          >
            <div className="field-grid">
              <label className="field">
                <span>Proof type</span>
                <select name="type" defaultValue="certificate">
                  {workspace.APP_CONFIG.proofItemTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Related skill</span>
                <select name="skillId" defaultValue={skillOptions[0]?.skillId || workspace.REFERENCE_DATA.skillsCatalog[0].id}>
                  {skillOptions.map((skill) => (
                    <option key={skill.id} value={skill.skillId}>
                      {skill.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Title</span>
                <input name="title" type="text" placeholder="Responsive dashboard project" required />
              </label>
              <label className="field">
                <span>Source</span>
                <input name="source" type="text" placeholder="Portfolio, Coursera, LeetCode, Mock panel" />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Date</span>
                <input name="date" type="date" required />
              </label>
              <label className="field">
                <span>URL</span>
                <input name="url" type="url" placeholder="https://example.com/proof" />
              </label>
            </div>
            <label className="field">
              <span>Certificate file</span>
              <input name="attachment" type="file" accept={PROOF_ATTACHMENT_ACCEPT} />
              <small>Optional. Upload PDF, DOC, DOCX, JPG, PNG, or WEBP up to {formatFileSize(workspace.APP_CONFIG.maxProofAttachmentBytes)}.</small>
            </label>
            <label className="field">
              <span>Notes</span>
              <textarea name="notes" rows="3" placeholder="Outcome, scope, score, or what this proof demonstrates." />
            </label>
            <FormError message={error} />
            <button className="primary-button" type="submit">
              Save proof item
            </button>
          </form>
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Market focus"
            title="Skills showing up in matching roles"
          />
          <div id="market-skills" className="stack-list">
            {demandSkills.length ? demandSkills.map((skill) => (
              <article className="skill-row card-tone" key={skill.id}>
                <div className="skill-row-top">
                  <strong>{skill.label}</strong>
                  <StatusBadge tone={skill.importance === "Critical" ? "danger" : (skill.importance === "Important" ? "warning" : "success")}>
                    {skill.importance}
                  </StatusBadge>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${skill.level}%` }} />
                </div>
                <p>{skill.demandCount} matching job mentions | {skill.proofCount} proof item(s) | {skill.level}% current level</p>
              </article>
            )) : (
              <EmptyState
                title="No demand signals yet."
                copy="Complete your profile to start receiving market-based skill guidance."
                action={<AppLink className="ghost-button small" to="/account#profile-form">Complete profile</AppLink>}
              />
            )}
          </div>
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Critical gaps"
            title="Skills that need attention first"
            copy="These skills appear frequently in matching jobs and either have low confidence or not enough proof attached yet."
          />
          <div className="stack-list">
            {weakSkills.length ? weakSkills.map((skill) => (
              <article className="list-row" key={skill.id}>
                <div>
                  <strong>{skill.label}</strong>
                  <p>{skill.demandCount} demand mentions | {skill.proofCount} proof item(s) | {skill.level}% current level</p>
                </div>
                <StatusBadge tone={skill.importance === "Critical" ? "danger" : "warning"}>{skill.importance}</StatusBadge>
              </article>
            )) : (
              <EmptyState
                title="No critical gaps right now."
                copy="Keep logging practice and proof so the demand map continues to reflect your real progress."
                action={<AppLink className="ghost-button small" to="/growth#proof-form">Add proof</AppLink>}
              />
            )}
          </div>
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Recommended resources"
            title="Useful learning steps"
            copy="Resources are ranked by overlap with the skills currently limiting your fit against matching jobs."
          />
          <div id="resource-recommendations" className="resource-grid">
            {resources.length ? resources.map((resource) => (
              <article className={`resource-card${resource.overlap > 0 ? " resource-card-highlight" : ""}`} key={resource.id}>
                <div className="resource-card-head">
                  <div>
                    <strong>{resource.title}</strong>
                    <p>{resource.provider}</p>
                  </div>
                  <StatusBadge tone={resource.overlap > 0 ? "accent" : "neutral"}>
                    {resource.overlap > 0 ? `${resource.overlap} gap overlaps` : "Reference"}
                  </StatusBadge>
                </div>
                <div className="badge-row">
                  <StatusBadge tone="neutral">{resource.type}</StatusBadge>
                  <StatusBadge tone="muted">{resource.difficulty}</StatusBadge>
                  <StatusBadge tone="warning">{resource.duration}</StatusBadge>
                </div>
                <p className="resource-card-copy">
                  {resource.overlap > 0
                    ? "Recommended because it overlaps with skills currently holding back stronger job fit."
                    : "Useful as a supporting reference once the highest-priority skill gaps are covered."}
                </p>
                <div className="resource-card-actions">
                  {resource.url ? (
                    <a className="ghost-button small" href={resource.url} target="_blank" rel="noreferrer">
                      Open resource
                    </a>
                  ) : null}
                </div>
              </article>
            )) : (
              <EmptyState
                title="No resources available."
                copy="The resource list will appear once the track and demand data are available."
              />
            )}
          </div>
        </article>
      </section>
    </WorkspaceShell>
  );
}

function AccountPage({ route, user, notice, navigate }) {
  const { database } = workspace.useWorkspaceState();
  const [error, setError] = useState("");
  const [roleTouched, setRoleTouched] = useState(false);
  const [form, setForm] = useState(() => buildProfileForm(user));
  const checklist = workspace.getProfileChecklist(user);
  const summaryItems = workspace.getAccountSummaryItems(user);

  useEffect(() => {
    setForm(buildProfileForm(user));
    setRoleTouched(false);
  }, [user.id, user.updatedAt]);

  useEffect(() => {
    if (roleTouched) {
      return;
    }

    const track = workspace.getCareerTrackById(form.trackId, database.careerTracks);
    setForm((current) => ({
      ...current,
      targetRole: track.targetRoles[0]
    }));
  }, [database.careerTracks, form.trackId, roleTouched]);

  return (
    <WorkspaceShell
      route={route}
      user={user}
      notice={notice}
      navigate={navigate}
      pageLabel="Profile and settings"
      pageTitle="Account"
      summary="Keep eligibility data, role preferences, and workspace exports accurate from one place."
      quickLinks={[
        <AppLink key="back" to="/dashboard">Back to dashboard</AppLink>,
        <AppLink key="edit" to="/account#profile-form">Edit profile</AppLink>,
        <AppLink key="summary" to="/account#account-summary">View summary</AppLink>
      ]}
    >
      <section className="content-grid">
        <article className="card">
          <SectionHeading
            eyebrow="Eligibility profile"
            title="Update profile details"
            copy="These fields directly affect job eligibility checks, recommendation quality, and the growth board."
          />
          <form
            id="profile-form"
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");

              try {
                workspace.updateProfile(form);
                workspace.setNotice("success", "Profile updated.");
              } catch (err) {
                const message = workspace.getErrorMessage(err);
                setError(message);
                workspace.setNotice("error", message);
              }
            }}
          >
            <div className="field-grid">
              <label className="field">
                <span>Full name</span>
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>College</span>
                <input
                  name="college"
                  type="text"
                  autoComplete="organization"
                  value={form.college}
                  onChange={(event) => setForm((current) => ({ ...current, college: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Branch</span>
                <input
                  name="branch"
                  type="text"
                  value={form.branch}
                  onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Graduation year</span>
                <input
                  name="graduationYear"
                  type="text"
                  value={form.graduationYear}
                  onChange={(event) => setForm((current) => ({ ...current, graduationYear: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>CGPA</span>
                <input
                  name="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={form.cgpa}
                  onChange={(event) => setForm((current) => ({ ...current, cgpa: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>Active backlogs</span>
                <input
                  name="activeBacklogs"
                  type="number"
                  min="0"
                  step="1"
                  value={form.activeBacklogs}
                  onChange={(event) => setForm((current) => ({ ...current, activeBacklogs: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Career path</span>
                <select
                  name="trackId"
                  value={form.trackId}
                  onChange={(event) => {
                    const nextTrackId = event.target.value;
                    const nextTrack = workspace.getCareerTrackById(nextTrackId, database.careerTracks);
                    setForm((current) => ({
                      ...current,
                      trackId: nextTrackId,
                      targetRole: roleTouched ? current.targetRole : nextTrack.targetRoles[0]
                    }));
                  }}
                >
                  {database.careerTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Target role</span>
                <input
                  name="targetRole"
                  type="text"
                  value={form.targetRole}
                  onChange={(event) => {
                    setRoleTouched(true);
                    setForm((current) => ({ ...current, targetRole: event.target.value }));
                  }}
                />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Placement type</span>
                <select
                  name="placementType"
                  value={form.placementType}
                  onChange={(event) => setForm((current) => ({ ...current, placementType: event.target.value }))}
                >
                  {workspace.APP_CONFIG.placementTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preferred locations</span>
                <input
                  name="preferredLocations"
                  type="text"
                  value={form.preferredLocations}
                  onChange={(event) => setForm((current) => ({ ...current, preferredLocations: event.target.value }))}
                />
              </label>
            </div>
            <label className="field">
              <span>Weekly focus</span>
              <input
                name="weeklyFocus"
                type="text"
                value={form.weeklyFocus}
                onChange={(event) => setForm((current) => ({ ...current, weeklyFocus: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea
                name="bio"
                rows="4"
                value={form.bio}
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              />
            </label>
            <FormError message={error} />
            <button className="primary-button" type="submit">
              Save profile
            </button>
          </form>
        </article>

        <article className="card">
          <SectionHeading
            eyebrow="Workspace tools"
            title="Export, import, or reset"
            copy="Use export before reset if you want a backup of your local-first workspace."
          />
          <div className="stack-list">
            <p className="muted-copy">Export includes the expanded profile, applications, planner tasks, proof items, and linked activity data.</p>
            <div className="action-row">
              <button
                id="export-account"
                className="ghost-button"
                type="button"
                onClick={() => {
                  try {
                    const raw = JSON.stringify(workspace.exportAccountBundle(), null, 2);
                    const blob = new Blob([raw], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = "jobhack-lite-account.json";
                    anchor.click();
                    URL.revokeObjectURL(url);
                    workspace.setNotice("success", "Profile exported.");
                  } catch (err) {
                    workspace.setNotice("error", workspace.getErrorMessage(err));
                  }
                }}
              >
                Export profile
              </button>
              <button
                id="reset-workspace"
                className="ghost-button"
                type="button"
                onClick={() => {
                  try {
                    workspace.resetWorkspace();
                  } catch (err) {
                    workspace.setNotice("error", workspace.getErrorMessage(err));
                  }
                }}
              >
                Reset workspace
              </button>
            </div>
            <label className="field">
              <span>Import profile</span>
              <input
                id="account-import"
                type="file"
                accept="application/json"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0];
                  if (!file) {
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      workspace.importAccount(JSON.parse(String(reader.result || "{}")));
                    } catch (err) {
                      workspace.setNotice("error", workspace.getErrorMessage(err));
                    } finally {
                      event.target.value = "";
                    }
                  };
                  reader.onerror = () => {
                    workspace.setNotice("error", "Could not read the selected JSON file.");
                    event.target.value = "";
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
            <div className="stack-list">
              {checklist.map((item) => (
                <article className="list-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                  <StatusBadge tone={item.complete ? "success" : "warning"}>{item.complete ? "Done" : "Pending"}</StatusBadge>
                </article>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <SectionHeading
          eyebrow="Account summary"
          title="Current workspace snapshot"
          copy="This summary reflects the profile and workspace data currently driving dashboard, planner, and growth guidance."
        />
        <div id="account-summary" className="metric-grid">
          {summaryItems.map((item) => (
            <article className="metric-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="next-actions" aria-label="Recommended next steps">
        <RouteCard
          kicker="Primary"
          title="Review the dashboard"
          copy="Use the updated profile to refresh job fit, blockers, and urgent actions."
          to="/dashboard"
        />
        <RouteCard
          kicker="Secondary"
          title="Inspect demand-heavy skills"
          copy="Return to Growth and check whether the updated profile changes the market view."
          to="/growth"
        />
      </section>
    </WorkspaceShell>
  );
}

export default App;
