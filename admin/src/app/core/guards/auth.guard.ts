import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../state/auth.store';

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  return authStore.ensureAuthenticated();
};

