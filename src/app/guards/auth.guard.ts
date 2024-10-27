import { CanActivateFn } from '@angular/router';
import { Injectable } from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};
