# MVPupper (Most Valuable Pupper) - Project TODO

## Phase 1: MVP UI & Core Features (PARTIALLY COMPLETE)

### Authentication & Setup
- [x] Login screen with name entry (basic version built)
- [x] Household setup screen with first dog creation (basic version built)
- [x] Improved login screen UI with better UX
- [x] Improved setup screen UI with better flow
- [x] Context management system for app state
- [x] Automatic navigation based on auth state
- [ ] Multi-dog addition UI
- [ ] Household member invitation system
- [ ] Household join via invite code

### Activity Logging (Free Tier)
- [x] Home screen with dog selector
- [x] Quick-tap activity buttons (Food, Water, Poop, Pee, Walk, Treat)
- [x] Real-time activity feed on home screen
- [x] Activity log screen with filtering by dog
- [x] Delete activity functionality
- [x] Activity timestamps with timezone support
- [x] AsyncStorage persistence for activities
- [ ] Notes/comments on activities

### Dog Profiles
- [x] Basic dog info (name, breed, age) in setup
- [ ] Dog photo upload
- [ ] Dog bio/description
- [ ] Microchip ID storage
- [ ] Microchip provider linking
- [ ] Emergency contact info
- [ ] Breed-specific health concerns tracking

### Free Tier Limitations
- [x] 2 dog limit enforcement
- [x] Premium upsell banner when trying to add 3rd dog
- [ ] Graceful error handling for limit

### UI/Design
- [x] Modern, crisp design with brown (#8B4513) accent color
- [x] Playful emoji-based icons
- [x] Bottom tab navigation (Home, Log, Calendar, Settings)
- [x] Mobile-first responsive design
- [ ] Smooth animations and satisfying interactions
- [ ] Loading states and empty states

## Phase 2: Authentication & Household Screens (COMPLETE)
- [x] Refine login screen UI
- [x] Build household creation flow
- [x] Implement proper context management
- [x] Automatic navigation based on auth state
- [ ] Build household join flow
- [ ] Test navigation between screens

## Phase 3: Activity Logging & Data Persistence (COMPLETE)
- [x] Activity interface with full type definitions
- [x] Home screen activity logging
- [x] Activity log screen with filtering
- [x] AsyncStorage persistence
- [x] Premium status tracking
- [x] Activity deletion

## Phase 4: Premium Features & Notifications

### Unlimited Dogs
- [ ] Remove 2-dog limit for premium users
- [ ] Allow adding unlimited dogs

### Premium Notifications (Key Monetization Feature)
- [ ] Push notification system
- [ ] Custom alert thresholds (e.g., "Alert if no food in 8 hours")
- [ ] Background task for checking thresholds
- [ ] Notification customization per dog
- [ ] Notification history

### Calendar & Appointments
- [x] Calendar screen UI (gated behind premium)
- [ ] Add vet appointments
- [ ] Add grooming appointments
- [ ] Add medication reminders
- [ ] Appointment notifications
- [ ] Recurring appointment support

### Medical & Health Tracking
- [ ] Flea/tick treatment logging
- [ ] Deworming schedule tracking
- [ ] Heat cycle/breeding info
- [ ] Vaccine tracking
- [ ] Medication reminders
- [ ] Weight tracking
- [ ] Temperature logging
- [ ] Blood glucose tracking
- [ ] Skin/coat health notes

### Data & Analytics
- [ ] Activity statistics per dog
- [ ] Export data functionality
- [ ] Historical trends

## Phase 5: Payment & Monetization

### Payment Integration
- [ ] Apple In-App Purchase integration (iOS)
- [ ] Google Play Billing integration (Android)
- [ ] Subscription status tracking
- [ ] Receipt validation
- [ ] Grandfathering logic for price increases
- [ ] Subscription cancellation handling

### Pricing
- Premium: $1.99/month or $29.99/year
- Free tier: 2 dogs max
- Premium unlocks: unlimited dogs + notifications + medical tracking

## Phase 6: Multi-User & Real-Time Features

### Household Management
- [ ] Household member invitations (via code or link)
- [ ] Max 5 members per household enforcement
- [ ] Real-time sync across household members
- [ ] Activity attribution (who logged what)
- [ ] Member permissions/roles

### Backend Infrastructure
- [ ] Server setup for subscription tracking
- [ ] Database schema (users, households, dogs, activities, subscriptions)
- [ ] API endpoints for syncing data
- [ ] Real-time sync mechanism (WebSocket or polling)
- [ ] Authentication tokens

## Phase 7: Testing & Deployment

### Testing
- [ ] Unit tests for activity logging
- [ ] Integration tests for household creation
- [ ] Premium tier gating tests
- [ ] Payment flow testing
- [ ] Cross-device sync testing

### App Store Submission
- [ ] iOS build configuration and signing
- [ ] Android build configuration and signing
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Beta testing with real users

### Deployment
- [ ] Backend hosting on Manus
- [ ] Database setup
- [ ] Monitoring and logging
- [ ] Error tracking

## Future Enhancements
- [ ] GPS tracking integration (microchip provider linking)
- [ ] Photo gallery for dogs
- [ ] Social features (share with vet, trainer)
- [ ] AI-powered health insights
- [ ] Integration with vet clinics
- [ ] Breed-specific health alerts
- [ ] Multi-pet household analytics
