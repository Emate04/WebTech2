import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductService } from '../shared/services/product.service';
import { AuthService } from '../shared/services/auth.service';
import { Product } from '../shared/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule,
    MatIconModule, MatToolbarModule, MatCardModule, MatChipsModule,
    MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule,
    MatTooltipModule, MatBadgeModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns = ['name', 'category', 'price', 'quantity', 'actions'];
  isLoading = true;
  currentUser = this.authService.getCurrentUser();

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Hiba a termékek betöltésekor', 'Bezárás', { duration: 3000 });
      }
    });
  }

  deleteProduct(id: string, name: string): void {
    if (!confirm(`Biztosan törli a(z) "${name}" terméket?`)) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
        this.snackBar.open('Termék sikeresen törölve', 'Bezárás', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Hiba a törlés során', 'Bezárás', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.quantity < 5).length;
  }
}
