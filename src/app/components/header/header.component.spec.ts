import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockBottomSheet: jasmine.SpyObj<MatBottomSheet>;

  beforeEach(async () => {
    // Crear spies para todos los servicios
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated$: of(true),
      user$: of({ name: 'Test User', email: 'test@example.com' }),
    });
    mockUserService = jasmine.createSpyObj('UserService', ['clearUserData']);
    mockBottomSheet = jasmine.createSpyObj('MatBottomSheet', ['open']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatBottomSheet, useValue: mockBottomSheet },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Propiedades de entrada (@Input)', () => {
    it('debería tener title con valor por defecto "Gastify"', () => {
      expect(component.title).toBe('Gastify');
    });

    it('debería aceptar un title personalizado', () => {
      component.title = 'Mi Título Personalizado';
      expect(component.title).toBe('Mi Título Personalizado');
    });

    it('debería tener currentMonth como string vacío por defecto', () => {
      expect(component.currentMonth).toBe('');
    });

    it('debería aceptar un currentMonth personalizado', () => {
      component.currentMonth = 'Enero 2025';
      expect(component.currentMonth).toBe('Enero 2025');
    });
  });

  describe('Eventos de salida (@Output)', () => {
    it('debería emitir previousMonth cuando onPreviousMonthClick() es llamado', () => {
      spyOn(component.previousMonth, 'emit');
      component.onPreviousMonthClick();
      expect(component.previousMonth.emit).toHaveBeenCalled();
    });

    it('debería emitir nextMonth cuando onNextMonthClick() es llamado', () => {
      spyOn(component.nextMonth, 'emit');
      component.onNextMonthClick();
      expect(component.nextMonth.emit).toHaveBeenCalled();
    });

    it('debería emitir notificationsClick cuando onNotificationsClick() es llamado', () => {
      spyOn(component.notificationsClick, 'emit');
      component.onNotificationsClick();
      expect(component.notificationsClick.emit).toHaveBeenCalled();
    });

    it('debería emitir profileClick cuando onProfileClick() es llamado', () => {
      spyOn(component.profileClick, 'emit');
      component.onProfileClick();
      expect(component.profileClick.emit).toHaveBeenCalled();
    });
  });

  describe('openNotifications()', () => {
    it('debería abrir el NotificationBottomSheet', () => {
      component.openNotifications();

      expect(mockBottomSheet.open).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({
          panelClass: 'notification-bottom-sheet-panel',
          backdropClass: 'notification-bottom-sheet-backdrop',
          hasBackdrop: true,
          closeOnNavigation: true,
        })
      );
    });

    it('debería emitir notificationsClick al abrir notificaciones', () => {
      spyOn(component.notificationsClick, 'emit');
      component.openNotifications();
      expect(component.notificationsClick.emit).toHaveBeenCalled();
    });
  });

  describe('openProfile()', () => {
    it('debería navegar a /profile', () => {
      component.openProfile();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });
  });

  describe('logout()', () => {
    it('debería limpiar los datos del usuario', () => {
      component.logout();
      expect(mockUserService.clearUserData).toHaveBeenCalled();
    });

    it('debería llamar a auth.logout con parámetros correctos', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    });

    it('debería navegar a /login después del logout', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Integración con el template', () => {
    it('debería mostrar el logo de la aplicación', () => {
      const logo = fixture.nativeElement.querySelector('.app-logo');
      expect(logo).toBeTruthy();
      expect(logo.getAttribute('alt')).toBe('Gastify');
    });

    it('debería tener un botón de notificaciones', () => {
      const notificationBtn = fixture.nativeElement.querySelector('.notification-btn');
      expect(notificationBtn).toBeTruthy();
    });

    it('debería tener un botón de perfil', () => {
      const profileBtn = fixture.nativeElement.querySelector('.profile-btn');
      expect(profileBtn).toBeTruthy();
    });

    it('debería abrir notificaciones cuando se hace clic en el botón', () => {
      spyOn(component, 'openNotifications');
      const notificationBtn = fixture.nativeElement.querySelector('.notification-btn');
      notificationBtn.click();
      expect(component.openNotifications).toHaveBeenCalled();
    });

    it('debería abrir perfil cuando se hace clic en el botón', () => {
      spyOn(component, 'openProfile');
      const profileBtn = fixture.nativeElement.querySelector('.profile-btn');
      profileBtn.click();
      expect(component.openProfile).toHaveBeenCalled();
    });
  });
});
