# **Thikana - A Real Estate Mobile Application**

**Thikana** is a full-featured **real estate marketplace mobile application** built with React Native and Expo. It allows users to browse, search, filter, and save properties available for **sale or rent.**

Administrators can create and manage property listings, including property details, images, pricing, and geographic coordinates. Users can explore property locations on a map, save properties for later, and contact the listing agent directly through WhatsApp.

---

## Core Architecture

- **Framework**: React Native with Expo (SDK ~54)
- **Navigation**: `expo-router` (file-based routing)
- **State Management**:
  - `zustand` (filter store, user store)
  - React hooks
- **Database**: Supabase (PostgreSQL) with RLS (Row Level Security) integrated with auth
- **Styling**: Tailwind CSS via `nativewind`
- **UI Components**: Custom components with shadcn-inspired design using `Ionicons`

---

## Key Features

### 1. **Authentication**

- Sign in/out flow
- Protected routes - signed-in users are redirected to the tabbed interface
- Admin role detection via Supabase `users` table

### 2. **Home Screen** (`/(root)/(tabs)/index`)

- **Featured properties** carousel with highlighted listings
- **Recommended properties** list
- User greeting with name
- Search bar that navigates to search screen

### 3. **Search & Filtering** (`/(root)/(tabs)/search`)

- Search by title or city
- Filters: property type, bedrooms, price range
- Filter presets (Under ৳50K, ৳50L–৳1Cr, etc.)
- Active filter chips with remove functionality
- Filter modal with apply/reset actions
- Results displayed with `PropertyCard` components

### 4. **Create Property** (`/(root)/(tabs)/create`)

- Full property form with:
  - Title, description, price
  - Property type (apartment/house/villa/studio)
  - Bedrooms/bathrooms counters
  - Area (sq ft)
  - Address and city
  - Location detection (via expo-location)
  - Image picker (up to 6 images, Supabase storage)
  - "Featured property" toggle
- Validation and error handling

### 5. **Saved Properties** (`/(root)/(tabs)/saved`)

- User-specific saved properties
- Supabase `saved_properties` table
- Can unsave properties
- "Browse Properties" CTA

### 6. **Profile** (`/(root)/(tabs)/profile`)

- User info from Database (name, email, profile picture)
- Sign out functionality
- Navigation to saved properties, help/support, my listings (admin only)

### 7. **Property Detail** (`/(root)/property/[id]`)

- Image carousel with horizontal scrolling
- Property specs (beds, baths, area, type)
- Description with "read more/less" toggle
- Location address
- OpenStreetMap preview
- WhatsApp contact button (hardcoded admin phone)

### 8. **Map Screen** (`/(root)/property/map`)

- Property location visualization
- OpenStreetMap based map preiew
- Geographic coordinates
- Option to open the location using Google Maps

---

## How to Run the Thikana App :

### 1. **Install Dependencies**

```bash
cd thikana-app
npm install
```

### 2. **Set Up Environment Variables**

The `.env` file should conatin:

```
EXPO_PUBLIC_SUPABASE_URL=****
EXPO_PUBLIC_SUPABASE_KEY=****
```

### 3. **Start the Development Server**

```bash
npm start
# or
npx expo start
```

### 4. **Run on Platforms**

**Android:**

```bash
npm run android
```

**iOS:**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

### 5. **Project Requirements**

- Node.js 18+ or 20+
- Expo CLI installed globally or via npx
- An Android emulator or iOS device for mobile testing
- Supabase project (for the database URL and key)

### 6. **Development Workflow**

- The app uses `expo-router` for file-based routing
- Navigation structure: `(root)/(tabs)` with tabs: Home, Search, Create, Saved, Profile
- Authentication is handled via Supabase Authentication - unauthenticated users are redirected to sign-in
- Supabase also provides the backend database with Row Level Security
- Images are stored in Supabase Storage bucket `property-images`

---

**Database Migrations**
The project includes SQL migration files used to configure and extend the Supabase PostgreSQL database.
