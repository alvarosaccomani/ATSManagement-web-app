import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const session = sessionService.getCurrentSession();
  let token = session?.token;

  if (!token) {
    try {
      const rawLocalStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('session') : null;
      if (rawLocalStorage) {
        token = JSON.parse(rawLocalStorage)?.token;
      }
    } catch (e) {
      console.error('Error reading localStorage in jwtInterceptor', e);
    }
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
