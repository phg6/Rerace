import React from "react";

/**
 * Branded admin graphics so the CMS feels like part of Rerace.
 * These are plain server components rendered by Payload's admin shell;
 * the racing-red / Zen Dots styling lives in (payload)/custom.css.
 */

export function BrandLogo() {
  return (
    <div className="rerace-brand rerace-brand--logo">
      <span className="rerace-brand__mark">Rerace</span>
      <span className="rerace-brand__label">Control Room</span>
    </div>
  );
}

export function BrandIcon() {
  return (
    <span className="rerace-brand rerace-brand--icon" aria-label="Rerace">
      R
    </span>
  );
}

export function BeforeLogin() {
  return (
    <p className="rerace-login-note">
      Sign in to manage events, streams, news and more across the Rerace network.
    </p>
  );
}
