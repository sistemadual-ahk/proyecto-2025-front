import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageTitleComponent } from './page-title.component';
import { Router } from '@angular/router';

describe('PageTitleComponent', () => {
  let component: PageTitleComponent;
  let fixture: ComponentFixture<PageTitleComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create a spy for the Router
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PageTitleComponent],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(PageTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con title vacío por defecto', () => {
    expect(component.title).toBe('');
  });

  it('debería inicializar con showBack como true por defecto', () => {
    expect(component.showBack).toBe(true);
  });

  it('debería mostrar el título correctamente cuando se establece', () => {
    component.title = 'Mi Página';
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('.title');
    expect(titleElement.textContent.trim()).toBe('Mi Página');
  });

  it('debería mostrar el botón de retroceso cuando showBack es true', () => {
    component.showBack = true;
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('.back-btn');
    expect(backButton).toBeTruthy();
  });

  it('no debería mostrar el botón de retroceso cuando showBack es false', () => {
    component.showBack = false;
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('.back-btn');
    expect(backButton).toBeFalsy();
  });

  it('debería emitir el evento back cuando se hace clic y hay observadores', () => {
    spyOn(component.back, 'emit');

    component.onBackClick();

    expect(component.back.emit).toHaveBeenCalled();
  });

  it('debería navegar usando backRoute cuando se proporciona y no hay observadores del evento back', () => {
    component.backRoute = ['/home'];
    component.back.observers.length = 0; // Simular que no hay observadores

    component.onBackClick();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería navegar a /home por defecto cuando no hay backRoute y no hay observadores', () => {
    component.backRoute = undefined;
    component.back.observers.length = 0;

    component.onBackClick();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería manejar backRoute como string', () => {
    component.backRoute = '/login';
    component.back.observers.length = 0;

    component.onBackClick();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería manejar backRoute como array', () => {
    component.backRoute = ['/profile', '123'];
    component.back.observers.length = 0;

    component.onBackClick();

    expect(router.navigate).toHaveBeenCalledWith(['/profile', '123']);
  });

  it('debería tener el aria-label correcto en el botón de retroceso', () => {
    const backButton = fixture.nativeElement.querySelector('.back-btn');
    expect(backButton.getAttribute('aria-label')).toBe('Volver');
  });

  it('debería actualizar el título cuando cambia dinámicamente', () => {
    component.title = 'Título Inicial';
    fixture.detectChanges();

    let titleElement = fixture.nativeElement.querySelector('.title');
    expect(titleElement.textContent.trim()).toBe('Título Inicial');

    component.title = 'Título Actualizado';
    fixture.detectChanges();

    titleElement = fixture.nativeElement.querySelector('.title');
    expect(titleElement.textContent.trim()).toBe('Título Actualizado');
  });
});
