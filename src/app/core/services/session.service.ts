import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Structure representing the authenticated user's session stored in `localStorage`.
 */
export interface SessionData {
  /** User identity profile object. */
  identity?: any;
  /** Signed JWT authentication token. */
  token?: string;
}


/**
 * Service managing the active user session, identity, and JWT token persistence in `localStorage`.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  /** Reactive state subject holding the current session data or `null` when logged out. */
  private sessionSubject = new BehaviorSubject<SessionData | null>(this.getStoredSession());

  constructor() { }

  /**
   * Stores or updates the authenticated user's identity in the active session.
   *
   * @param identity User identity object or serialized JSON string.
   */
  public setIdentity(identity: any | string): void {
    const identityObj = typeof identity === 'string' 
      ? JSON.parse(identity) 
      : identity;
    
    const current = this.getCurrentSession();
    const updated = { ...current, identity: identityObj };
    this.updateSession(updated);
  }

  /**
   * Stores or updates the JWT authentication token in the active session.
   *
   * @param token Signed JWT string.
   */
  public setToken(token: string): void {
    const current = this.getCurrentSession();
    const updated = { ...current, token };
    this.updateSession(updated);
  }

  /**
   * Returns the currently authenticated user's identity object, or `null` if unauthenticated.
   *
   * @returns The user identity object or `null`.
   */
  public getIdentity(): any | null {
    return this.getCurrentSession()?.identity || null;
  }

  /**
   * Returns the complete current session state (`identity` and `token`).
   *
   * @returns The active {@link SessionData} or `null`.
   */
  public getCurrentSession(): SessionData | null {
    return this.sessionSubject.value;
  }

  /**
   * Clears the stored session from `localStorage` and resets the session state to `null`.
   */
  public logout(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(null);
  }

  /**
   * Persists the given session object to `localStorage` and emits it to subscribers.
   *
   * @param session Session data to persist.
   */
  private updateSession(session: SessionData): void {
    localStorage.setItem('session', JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  /**
   * Reads and parses the initial session state from `localStorage`.
   *
   * @returns The parsed {@link SessionData} or `null` if not found or invalid.
   */
  private getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem('session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored session:', error);
      return null;
    }
  }
}
