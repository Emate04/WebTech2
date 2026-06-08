import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'products/new',
    canActivate: [authGuard],
    loadComponent: () => import('./products/product-form.component').then(m => m.ProductFormComponent)
  },
  {
    path: 'products/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./products/product-form.component').then(m => m.ProductFormComponent)
  },
  { path: '**', redirectTo: 'products' }
];
