import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { VouchersFeeStatusService } from '../../../core/services/vouchers-fee-status.service';

/**
 * Component for creating and editing a voucher fee (installment) status record.
 * @description Provides a reactive form for managing installment status name and description.
 */
@Component({
  selector: 'app-voucher-fee-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzDividerModule
  ],
  templateUrl: './voucher-fee-status.component.html',
  styleUrl: './voucher-fee-status.component.scss'
})
export class VoucherFeeStatusComponent implements OnInit {
  /** Reactive form group for installment status fields. */
  form: FormGroup;
  /** Flag indicating whether a request is in progress. */
  isLoading = false;
  /** Flag indicating whether the form is in edit mode. */
  isEditing = false;
  /** UUID of the installment status being edited, or null when creating. */
  voucherFeeStatusId: string | null = null;

  /**
   * Initializes the VoucherFeeStatusComponent and builds the reactive form.
   * @param fb Angular FormBuilder service.
   * @param route ActivatedRoute for reading route parameters.
   * @param router Angular Router service.
   * @param _vouchersFeeStatusService Service for installment status CRUD operations.
   * @param message Ng-Zorro toast message service.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _vouchersFeeStatusService: VouchersFeeStatusService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      voufs_uuid: [{ value: '', disabled: true }],
      voufs_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      voufs_description: ['', [Validators.maxLength(255)]]
    });
  }

  /**
   * Lifecycle hook executed on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    this.voucherFeeStatusId = this.route.snapshot.paramMap.get('voufs_uuid');
    this.isEditing = !!this.voucherFeeStatusId;
    
    if (this.isEditing) {
      this.loadVoucherFeeStatus();
    } else {
      this.form.get('voufs_uuid')?.disable();
    }
  }

  /**
   * Loads an existing installment status record by ID and populates the form.
   * @returns void
   */
  loadVoucherFeeStatus(): void {
    this.isLoading = true;
    this._vouchersFeeStatusService.getVoucherFeeStatusById(this.voucherFeeStatusId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const voucherFeeStatus = response.data;
          this.form.get('voufs_uuid')?.enable();
          this.form.patchValue(voucherFeeStatus);
          this.form.get('voufs_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del estado de cuota');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el estado de cuota');
      }
    });
  }

  /**
   * Validates and submits the form to create or update the installment status.
   * @returns void
   */
  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor complete todos los campos obligatorios');
      return;
    }

    this.isLoading = true;

    if(!this.isEditing) {
      this._vouchersFeeStatusService.saveVoucherFeeStatus(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado de cuota creado correctamente');
            this.router.navigate(['/admin/user/vouchers-fee-status']);
          } else {
            this.message.error(response.message || 'Error al guardar el estado de cuota');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._vouchersFeeStatusService.updateVoucherFeeStatus(this.voucherFeeStatusId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado de cuota actualizado correctamente');
            this.router.navigate(['/admin/user/vouchers-fee-status']);
          } else {
            this.message.error(response.message || 'Error al actualizar el estado de cuota');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    }
  }

  /**
   * Cancels the operation and navigates back to the installment statuses list.
   * @returns void
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/vouchers-fee-status']);
  }

  /**
   * Retrieves the validation error message for a form control.
   * @param controlName Name of the form control.
   * @returns Validation error message or null.
   */
  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return null;
  }
}
