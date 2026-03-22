import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// Registar locale PT para formatar datas e moeda (AOA) correctamente
// Ex: 1000000 → "1.000.000,00 Kz"
registerLocaleData(localePt, 'pt');

export const appConfig: ApplicationConfig = {
  providers: [

    // Locale PT — datas e moeda em formato angolano
    { provide: LOCALE_ID, useValue: 'pt' },

    // Roteamento com scroll para o topo ao navegar entre páginas
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),

    // HTTP com os três interceptors encadeados:
    //   1. authInterceptor    — injeta o token JWT em cada pedido
    //   2. errorInterceptor   — trata erros 401/403/500 globalmente
    //   3. loadingInterceptor — mostra/esconde o spinner global
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor,
      ])
    ),

    // Animações Material carregadas de forma assíncrona
    // (só carregam quando um componente que as usa é aberto)
    provideAnimationsAsync(),

    // NgRx — gestão de estado global
    provideStore({}),
    provideEffects([]),

    // DevTools do NgRx — só activo em desenvolvimento
    // Permite ver todas as acções e o estado no browser
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),

  ],
};