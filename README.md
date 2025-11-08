# Suprise Supermarket - Performance Optimized

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Performance Optimizations

This application has been optimized for 5x faster loading times through the following techniques:

### 1. Code Splitting & Lazy Loading
- All pages and components are lazy loaded using React.lazy
- Critical routes are preloaded using webpackPreload hints
- Suspense boundaries provide smooth loading experiences

### 2. Caching & Data Optimization
- React Query configured with extended cache times (10-15 minutes)
- Disabled unnecessary refetching (on window focus, mount, reconnect)
- Optimized stale time to reduce network requests

### 3. Asset Optimization
- Preloaded critical fonts and images
- Added loading="lazy" attributes to non-critical images
- Hardware acceleration enabled for layout components

### 4. Service Worker Caching
- Custom service worker caches static assets
- Cache-first strategy for improved load times
- Automatic cache cleanup for outdated versions

### 5. Build Optimizations
- Source maps disabled in production builds
- Minified CSS and JavaScript
- Tree-shaking enabled

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run build:prod`

Builds the app for production with additional optimizations:
- Source maps disabled for smaller bundle size
- Full minification enabled

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).