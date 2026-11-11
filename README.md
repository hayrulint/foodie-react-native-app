# Foodie 🍳

Foodie is a recipe app built with **React Native + Expo** for the final project of the Coursera course *React Native: Developing Android and iOS Apps*.

Browse recipes by category, open full recipe details, save favorites and manage your own recipes.

## Run it

**Snack Expo (no install):** open [snack.expo.dev](https://snack.expo.dev), choose **Import git repository** and paste this repository's URL. Use the *Web* preview or scan the QR code with **Expo Go**.

**Locally:**

```bash
npm install
npx expo start        # then press "w" for web, or scan the QR code with Expo Go
```

## Features

| Requirement | Where to find it |
|---|---|
| Main feed with 12+ recipe categories in a horizontal bar | Home screen, top bar (Breakfast, Pasta, Chicken, Beef, Seafood, Vegetarian, Salads, Soups, Desserts, Asian, Baking, Drinks) |
| Recipe details: ingredients, instructions, prep time, servings, calories, difficulty | Tap any recipe card |
| Category filtering | Tap a category chip – only that category's recipes are shown |
| Heart icon to favorite / unfavorite (toggles) | On every recipe card and in the recipe details header |
| Favorites section | "Favorites" chip in the categories bar (or the ❤ icon top-right) |
| "My Food" with "Add New Recipe" | "My Food" chip in the categories bar |
| Add New Recipe form: name, image upload, ingredients list, step-by-step instructions, **Save Recipe** button | My Food → Add New Recipe |
| New recipes listed in "My Recipes" | My Food section |
| Full details for own recipes (name, image, ingredients, instructions) | Tap a recipe in My Recipes |
| Edit and Delete buttons (working) | On each card in My Recipes and on the recipe details screen |
| Functional back button | ← arrow in the header on every inner screen (Android hardware back is supported too) |

Favorites and your own recipes are saved with AsyncStorage, so they survive an app reload.

## Project structure

```
App.js                     # state, persistence and a small stack navigator
data/recipes.js            # categories and 28 built-in recipes
screens/HomeScreen.js      # main feed, categories bar, Favorites, My Food / My Recipes
screens/RecipeDetailScreen.js
screens/RecipeFormScreen.js  # Add / Edit recipe
components/                # Header, HeartButton, RecipeImage, ConfirmModal
theme.js
```

Recipe photos: [TheMealDB](https://www.themealdb.com).
