import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let userService: UserService;

  const mockAuthService = {
    isAuthenticated$: of(false),
    user$: of(null) as any,
    loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
    logout: jasmine.createSpy('logout'),
  };

  const mockUserService = {
    createUser: jasmine.createSpy('createUser').and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    userService = TestBed.inject(UserService);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener loginInternoHabilitado como false inicialmente', () => {
    expect(component.loginInternoHabilitado).toBeFalse();
  });

  it('debería tener username y password vacíos inicialmente', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
  });

  it('debería tener showPassword como false inicialmente', () => {
    expect(component.showPassword).toBeFalse();
  });

  describe('togglePasswordVisibility()', () => {
    it('debería alternar showPassword de false a true', () => {
      component.showPassword = false;
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTrue();
    });

    it('debería alternar showPassword de true a false', () => {
      component.showPassword = true;
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('onSubmit()', () => {
    it('debería navegar a /home cuando se envía el formulario', () => {
      component.username = 'test@example.com';
      component.password = 'password123';
      component.onSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('debería hacer console.log con los datos de login', () => {
      spyOn(console, 'log');
      component.username = 'test@example.com';
      component.password = 'secret';
      component.onSubmit();
      expect(console.log).toHaveBeenCalledWith('Login:', {
        username: 'test@example.com',
        password: 'secret',
      });
    });
  });

  describe('onGoogleLogin()', () => {
    it('debería navegar a /home', () => {
      component.onGoogleLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('debería hacer console.log', () => {
      spyOn(console, 'log');
      component.onGoogleLogin();
      expect(console.log).toHaveBeenCalledWith('Google login');
    });
  });

  describe('loginWithGoogle()', () => {
    it('debería llamar a auth.loginWithRedirect con parámetros correctos', () => {
      component.loginWithGoogle();
      expect(mockAuthService.loginWithRedirect).toHaveBeenCalledWith({
        appState: {
          target: '/home',
        },
        authorizationParams: {
          connection: 'google-oauth2',
        },
      });
    });
  });

  describe('navegarARegister()', () => {
    it('debería navegar a /register', () => {
      component.navegarARegister();
      expect(router.navigate).toHaveBeenCalledWith(['/register']);
    });
  });

  describe('ngOnInit() con usuario autenticado', () => {
    it('debería crear usuario cuando está autenticado', fakeAsync(() => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        sub: 'auth0|123',
      };

      mockAuthService.isAuthenticated$ = of(true);
      mockAuthService.user$ = of(mockUser);

      const newComponent = TestBed.createComponent(LoginComponent);
      newComponent.detectChanges();

      expect(mockUserService.createUser).toHaveBeenCalled();
    }));

    it('debería navegar a /home cuando se crea el usuario exitosamente', fakeAsync(() => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        sub: 'auth0|123',
      };

      mockAuthService.isAuthenticated$ = of(true);
      mockAuthService.user$ = of(mockUser);
      mockUserService.createUser.and.returnValue(of({}));

      const newComponent = TestBed.createComponent(LoginComponent);
      newComponent.detectChanges();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('no debería navegar cuando hay error 409 (usuario ya existe)', fakeAsync(() => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        sub: 'auth0|123',
      };

      mockAuthService.isAuthenticated$ = of(true);
      mockAuthService.user$ = of(mockUser);
      mockUserService.createUser.and.returnValue(
        throwError(() => ({ status: 409 }))
      );

      spyOn(console, 'error');

      const newComponent = TestBed.createComponent(LoginComponent);
      newComponent.detectChanges();
      tick();

      expect(console.error).not.toHaveBeenCalled();
    }));
  });
});
