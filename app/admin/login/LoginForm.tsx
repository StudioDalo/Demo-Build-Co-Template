"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-5 space-y-3">
      <label htmlFor="password" className="label">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" className="input" required autoFocus />
      {state?.error && <p className="field-error" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>Sign in</button>
    </form>
  );
}
