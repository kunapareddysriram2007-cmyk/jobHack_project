import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const RouterContext = createContext(null);

function normalizePathname(pathname) {
  let path = String(pathname || "/");

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path === "/index.html" || path === "/index") {
    return "/";
  }

  const [cleanPath] = path.split("#");
  const withoutExt = cleanPath.replace(/\.html$/i, "");

  if (withoutExt.startsWith("/pages/")) {
    return `/${withoutExt.split("/").pop()}`;
  }

  return withoutExt.length > 1 && withoutExt.endsWith("/")
    ? withoutExt.slice(0, -1)
    : withoutExt;
}

function readLocationState(pathname, hash = "", search = "") {
  const normalizedPath = normalizePathname(pathname);
  const params = new URLSearchParams(search || "");
  const routeParam = params.get("route");

  if (routeParam && normalizedPath === "/") {
    const [routePart, hashPart = ""] = String(routeParam).split("#");
    return {
      pathname: normalizePathname(routePart || "/"),
      hash: hashPart ? `#${hashPart}` : ""
    };
  }

  return {
    pathname: normalizedPath,
    hash: hash || ""
  };
}

function pathForRoute(route, hash = "") {
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `${cleanRoute}${hash || ""}`;
}

function useRouter() {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error("useRouter must be used within RouterProvider.");
  }

  return context;
}

function RouterProvider({ children }) {
  const [locationState, setLocationState] = useState(() => ({
    ...readLocationState(
      window.location.pathname,
      window.location.hash || "",
      window.location.search || ""
    )
  }));

  useEffect(() => {
    const handlePopState = () => {
      setLocationState(readLocationState(
        window.location.pathname,
        window.location.hash || "",
        window.location.search || ""
      ));
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  useEffect(() => {
    const nextLocation = readLocationState(
      window.location.pathname,
      window.location.hash || "",
      window.location.search || ""
    );
    const nextUrl = `${nextLocation.pathname}${nextLocation.hash}`;

    if (nextUrl !== `${window.location.pathname}${window.location.hash}` || window.location.search) {
      window.history.replaceState({}, "", nextUrl);
      setLocationState(nextLocation);
    }
  }, []);

  useEffect(() => {
    if (!locationState.hash) {
      return;
    }

    const id = locationState.hash.slice(1);
    if (!id) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [locationState.hash, locationState.pathname]);

  const navigate = useCallback((to, options = {}) => {
    if (!to) {
      return;
    }

    const nextUrl = String(to);
    const replace = Boolean(options.replace);

    if (nextUrl.startsWith("#")) {
      if (replace) {
        window.history.replaceState({}, "", `${locationState.pathname}${nextUrl}`);
      } else {
        window.history.pushState({}, "", `${locationState.pathname}${nextUrl}`);
      }

      setLocationState({
        pathname: locationState.pathname,
        hash: nextUrl
      });
      return;
    }

    const [routePart, hashPart = ""] = nextUrl.split("#");
    const path = normalizePathname(routePart || "/");
    const hash = hashPart ? `#${hashPart}` : "";

    if (replace) {
      window.history.replaceState({}, "", `${path}${hash}`);
    } else {
      window.history.pushState({}, "", `${path}${hash}`);
    }

    setLocationState({
      pathname: path,
      hash
    });
  }, [locationState.pathname]);

  const value = useMemo(() => ({
    pathname: locationState.pathname,
    hash: locationState.hash,
    route: locationState.pathname,
    navigate,
    pathForRoute
  }), [locationState.hash, locationState.pathname, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function AppLink({ to, href: fallbackHref, onClick, children, ...rest }) {
  const router = useRouter();
  const route = typeof to === "string" ? to : String(to || "");
  const href = typeof fallbackHref === "string" && fallbackHref ? fallbackHref : route;
  const isInternalRoute = route.startsWith("/");

  function handleClick(event) {
    if (!isInternalRoute) {
      if (onClick) {
        onClick(event);
      }
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      if (onClick) {
        onClick(event);
      }
      return;
    }

    event.preventDefault();
    router.navigate(route);

    if (onClick) {
      onClick(event);
    }
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export {
  AppLink,
  RouterProvider,
  normalizePathname,
  pathForRoute,
  useRouter
};
