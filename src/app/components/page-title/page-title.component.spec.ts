// src/app/components/page-title/page-title.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { PageTitleComponent } from './page-title.component';
import { Router } from '@angular/router';

describe('PageTitleComponent (isolated back logic)', () => {
    let component: PageTitleComponent;
    let routerNavigateSpy: jasmine.Spy;

    const routerMock = {
        navigate: jasmine.createSpy('navigate')
    } as unknown as Router;

    beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [PageTitleComponent],
        providers: [{ provide: Router, useValue: routerMock }]
    });
    const fixture = TestBed.createComponent(PageTitleComponent);
    component = fixture.componentInstance;

    // Reseteo el espía entre tests
    routerNavigateSpy = TestBed.inject(Router).navigate as jasmine.Spy;
    routerNavigateSpy.calls.reset();
});

it('emite "back" si hay suscriptores y NO navega', () => {
    const backSpy = jasmine.createSpy('backSpy');
    component.back.subscribe(backSpy);

    component.onBackClick();

    expect(backSpy).toHaveBeenCalled();
    expect(routerNavigateSpy).not.toHaveBeenCalled();
});

    it('navega con backRoute si es array', () => {
        component.backRoute = ['/wallets', '123'];
        // NO hay suscriptores => observed = false, por lo que navega
        component.onBackClick();

        expect(routerNavigateSpy).toHaveBeenCalledOnceWith(['/wallets', '123'] as any);
    });

    it('navega con backRoute si es string (lo envuelve en array)', () => {
        component.backRoute = '/analysis';
        component.onBackClick();

        expect(routerNavigateSpy).toHaveBeenCalledOnceWith(['/analysis']);
    });

    it('fallback: navega a /home si no hay suscriptores ni backRoute', () => {
        component.backRoute = undefined;
        component.onBackClick();

        expect(routerNavigateSpy).toHaveBeenCalledOnceWith(['/home']);
    });
});
