# Header Block

## Overview

The Header block provides the main site navigation and header functionality, including dynamic category menu loaded from Adobe Commerce, search, mini cart, wishlist, and authentication features. It supports both desktop and mobile responsive layouts with dropdown menus, overlays, and keyboard accessibility.

## Integration

### Block Configuration

This block does not require any configuration parameters. It reads metadata from the page for navigation and fragment paths.

### Metadata Configuration

The block reads the following metadata values:
- `nav` - Path to navigation fragment (defaults to `/nav`)
- `mini-cart` - Path to mini cart fragment (defaults to `/mini-cart`)
- `wishlist` - Path to wishlist page (defaults to `/wishlist`)

### URL Parameters

No URL parameters directly affect this block's behavior.

### Local Storage

No localStorage keys are used by this block.

### Events

#### Event Listeners

- `events.on('cart/data', callback)` - Listens for cart data updates to update cart item counter and preload mini cart fragment
- Various keyboard and focus events for accessibility (Escape key, focusout, etc.)

#### Event Emitters

- `publishShoppingCartViewEvent()` - Emits shopping cart view event when mini cart is opened

## Behavior Patterns

### Page Context Detection

- **Desktop View** (≥900px): Navigation shows horizontal menu with hover-activated dropdowns and overlay
- **Mobile View** (<900px): Navigation shows hamburger menu with slide-out drawer and accordion-style submenus
- **Cart State**: Cart button displays item count badge when cart has items
- **Search State**: Search panel opens/closes with keyboard focus management

### Category Menu Integration

The header dynamically loads and displays categories from Adobe Commerce as the first menu items:

1. **Category Loading**: Categories are fetched from the Commerce GraphQL endpoint using the Catalog Service API
2. **Menu Structure**: Categories are rendered as nested navigation items with support for up to 3 levels
3. **Performance**: Category data is cached and loaded in parallel with navigation fragment
4. **Error Handling**: If category loading fails, the header continues to function with existing navigation items

### User Interaction Flows

1. **Navigation Menu**:
   - Desktop: Hover over menu items to reveal dropdown submenus with overlay
   - Mobile: Tap hamburger icon to open/close navigation drawer
   - Keyboard: Use Tab to navigate, Enter/Space to expand dropdowns, Escape to close

2. **Category Menu**:
   - Categories appear as first items in navigation
   - Supports nested category structure with dropdown menus
   - Clicking category links navigates to category pages

3. **Search**:
   - Click search icon to open search panel
   - Type to search (minimum 3 characters)
   - Results appear in dropdown with product images and links
   - Submit form or click "View All Results" to navigate to search page

4. **Mini Cart**:
   - Click cart icon to open mini cart panel
   - Panel loads cart fragment on first open (lazy loading)
   - Shows cart item count badge when items are present
   - Click outside panel to close

5. **Wishlist**:
   - Click wishlist icon to navigate to wishlist page

6. **Authentication**:
   - Shows login/account dropdown based on authentication state
   - Combines authentication options in navigation sections

### Responsive Behavior

- **Desktop**: Horizontal navigation with hover dropdowns, overlay for submenus
- **Mobile**: Hamburger menu with slide-out drawer, accordion submenus, full-screen overlay
- **Window Resize**: Automatically adjusts behavior when crossing breakpoint threshold

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and Escape keys
- **ARIA Attributes**: Proper ARIA labels, expanded states, and busy states
- **Focus Management**: Focus trapping in mobile menu, focus restoration on close
- **Screen Reader Support**: Semantic HTML and ARIA attributes for assistive technologies

### Error Handling

- **Category Loading Errors**: If category fetch fails, logs error and continues with existing navigation items
- **Fragment Loading Errors**: If navigation or mini cart fragments fail to load, shows empty state
- **Search Errors**: If search initialization fails, search panel remains non-functional but doesn't break header
- **Configuration Errors**: Falls back to default paths if metadata is missing
- **Network Errors**: Gracefully handles network failures with error logging
- **Fallback Behavior**: Header always renders basic structure even if optional features fail

