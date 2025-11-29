import {
  trigger,
  transition,
  style,
  query,
  animate,
  group
} from '@angular/animations';

// Smooth fade and slide animation for page transitions
export const routeAnimations = trigger('routeAnimations', [
  // Login to Dashboard (slide left)
  transition('login => dashboard', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateX(30px)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'translateX(-30px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'translateX(0)'
        }))
      ], { optional: true })
    ])
  ]),

  // Dashboard to Login (slide right)
  transition('dashboard => login', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateX(-30px)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'translateX(30px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'translateX(0)'
        }))
      ], { optional: true })
    ])
  ]),

  // Dashboard <-> History (fade with slight scale)
  transition('dashboard <=> history', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'scale(0.98) translateY(10px)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'scale(0.98) translateY(-10px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'scale(1) translateY(0)'
        }))
      ], { optional: true })
    ])
  ]),

  // Dashboard <-> Product Detail (zoom effect)
  transition('dashboard <=> productDetail', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'scale(0.95)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('350ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'scale(1.02)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('350ms 50ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'scale(1)'
        }))
      ], { optional: true })
    ])
  ]),

  // History <-> Product Detail
  transition('history <=> productDetail', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'translateY(-20px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ])
  ]),

  // Default transition (fade)
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('250ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('250ms 100ms ease-in', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);
