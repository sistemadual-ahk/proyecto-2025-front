import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WalletsComponent } from './wallets.component';
import { Billetera } from '../../services/billetera.service';

describe('WalletsComponent', () => {
  let component: WalletsComponent;
  let fixture: ComponentFixture<WalletsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [WalletsComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(WalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería alternar el estado del menú con toggleMenu()', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('debería cerrar el menú con closeMenu()', () => {
    component.isMenuOpen = true;
    component.closeMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('debería navegar a /home al ejecutar goBack()', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería calcular correctamente el balance total', () => {
    const total = component.wallets.reduce((sum, w) => sum + w.balance, 0);
    expect(component.totalBalance).toBe(total);
  });

  it('debería almacenar el tipo override y recargar al guardar una cuenta', () => {
    const loadDataSpy = spyOn<any>(component, 'loadData');
    const setOverrideSpy = spyOn<any>(component, 'setWalletTypeOverride').and.callThrough();
    component.showAddAccountModal = true;
    const wallet = { id: '123', balance: 0, nombre: 'Test', isDefault: false } as Billetera;
    component.handleAccountSaved({ wallet, type: 'digital', mode: 'create', payload: {} });
    expect(component.showAddAccountModal).toBeFalse();
    expect(setOverrideSpy).toHaveBeenCalledWith('123', 'digital');
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('debería establecer una billetera como predeterminada con setAsDefault()', () => {
    const wallet = component.wallets[1];
    component.openWalletPopup(wallet);
    component.setAsDefault();
    expect(wallet.isDefault).toBeTrue();
  });

  it('debería devolver etiquetas correctas en getWalletTypeLabel()', () => {
    expect(component.getWalletTypeLabel('bank')).toBe('Cuenta bancaria');
    expect(component.getWalletTypeLabel('digital')).toBe('Billetera digital');
    expect(component.getWalletTypeLabel('cash')).toBe('Efectivo');
  });

  it('debería formatear correctamente los montos en pesos', () => {
    const formatted = component.formatCurrency(10000);
    expect(formatted).toContain('$');
  });
});
