import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProductService } from '../shared/services/product.service';

const CATEGORIES = [
  'Elektronika', 'Ruházat', 'Élelmiszer', 'Bútor', 'Sport',
  'Játék', 'Könyv', 'Kozmetikum', 'Autóalkatrész', 'Egyéb'
];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatSelectModule, MatToolbarModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isLoading = false;
  isLoadingData = false;
  isEditMode = false;
  productId: string | null = null;
  categories = CATEGORIES;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string): void {
    this.isLoadingData = true;
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
        this.isLoadingData = false;
      },
      error: () => {
        this.isLoadingData = false;
        this.snackBar.open('Hiba a termék betöltésekor', 'Bezárás', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = {
      ...this.productForm.value,
      price: Number(this.productForm.value.price),
      quantity: Number(this.productForm.value.quantity)
    };

    const request = this.isEditMode
      ? this.productService.update(this.productId!, formValue)
      : this.productService.create(formValue);

    request.subscribe({
      next: () => {
        const msg = this.isEditMode ? 'Termék sikeresen frissítve' : 'Termék sikeresen hozzáadva';
        this.snackBar.open(msg, 'Bezárás', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Hiba történt', 'Bezárás', { duration: 3000 });
      }
    });
  }

  getError(field: string): string {
    const ctrl = this.productForm.get(field);
    if (!ctrl?.touched) return '';

    if (ctrl.hasError('required')) return 'Ez a mező kötelező';
    if (ctrl.hasError('minlength')) return `Minimum ${ctrl.errors?.['minlength'].requiredLength} karakter szükséges`;
    if (ctrl.hasError('maxlength')) return `Maximum ${ctrl.errors?.['maxlength'].requiredLength} karakter engedélyezett`;
    if (ctrl.hasError('min')) return 'Az érték nem lehet negatív';
    if (ctrl.hasError('pattern')) return 'Csak egész szám adható meg';
    return '';
  }
}
