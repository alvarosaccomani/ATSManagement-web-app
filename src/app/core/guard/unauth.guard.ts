import { CanActivateChildFn } from '@angular/router';

export const unauthGuard: CanActivateChildFn = (childRoute, state) => {
  return true;
};
