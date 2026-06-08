import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./login.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/products']);
        this.snackBar.open('Sikeres regisztráció!', 'Bezárás', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(
          err.error?.message || 'Regisztrációs hiba',
          'Bezárás',
          { duration: 3000, panelClass: 'error-snackbar' }
        );
      }
    });
  }

  getNameError(): string {
    const ctrl = this.registerForm.get('name');
    if (ctrl?.hasError('required')) return 'A név megadása kötelező';
    if (ctrl?.hasError('minlength')) return 'Minimum 3 karakter szükséges';
    return '';
  }

  getPasswordError(): string {
    const ctrl = this.registerForm.get('password');
    if (ctrl?.hasError('required')) return 'A jelszó megadása kötelező';
    if (ctrl?.hasError('minlength')) return 'Minimum 6 karakter szükséges';
    return '';
  }
}
