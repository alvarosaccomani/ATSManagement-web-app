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
import { BanksService } from '../../../core/services/banks.service';

@Component({
  selector: 'app-bank',
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
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss'
})
export class BankComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  bankId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _banksService: BanksService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      ban_uuid: [{ value: '', disabled: true }],
      ban_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      ban_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.bankId = this.route.snapshot.paramMap.get('ban_uuid');
    this.isEditing = !!this.bankId;
    
    if (this.isEditing) {
      this.loadBank();
    } else {
      // Para nuevo, deshabilitar el campo UUID ya que es autogenerado
      this.form.get('ban_uuid')?.disable();
    }
  }

  loadBank(): void {
    this.isLoading = true;

    this._banksService.getBankById(this.bankId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const bank = response.data;

          this.form.get('ban_uuid')?.enable();
          this.form.patchValue(bank);
          this.form.get('ban_uuid')?.disable();
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

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
      this._banksService.saveBank(this.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            // this._messageService.success(
            //   "Informacion", 
            //   "El Rubro fue agregado correctamente.",
            //   () => {
            //     this.router.navigate(['/admin/user/banks']);
            //   }
            // );
            this.router.navigate(['/admin/user/banks']);
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            // if(errorMessage != null) {
            //   this._messageService.error(
            //     "Error", 
            //     errorMessage.error.error
            //   );
            // }
            this.message.success(errorMessage.error.error);
        }
      )
    } else {
      this._banksService.updateBank(this.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            this.router.navigate(['/admin/user/banks']);
            // this._messageService.success(
            //   "Informacion", 
            //   "El Banco fue actualizado correctamente.",
            //   () => {
            //     this.router.navigate(['/admin/user/banks']);
            //   }
            // );
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error => {
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage != null) {
              // this._messageService.error(
              //   "Error", 
              //   errorMessage.error.error
              // );
              this.message.success(errorMessage.error.error);
            }
        }
      )
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/banks']);
  }

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