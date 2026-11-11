import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RECIPES } from './data/recipes';
import { COLORS } from './theme';
import HomeScreen from './screens/HomeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import RecipeFormScreen from './screens/RecipeFormScreen';

const FAVORITES_KEY = 'foodie:favorites';
const MY_RECIPES_KEY = 'foodie:myRecipes';

export default function App() {
  // Simple stack navigator: the last entry is the visible screen.
  const [stack, setStack] = useState([{ name: 'Home' }]);
  const [category, setCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [fav, mine] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(MY_RECIPES_KEY),
        ]);
        if (fav) setFavorites(JSON.parse(fav));
        if (mine) setMyRecipes(JSON.parse(mine));
      } catch (e) {
        console.warn('Failed to load saved data', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(MY_RECIPES_KEY, JSON.stringify(myRecipes)).catch(() => {});
  }, [myRecipes, loaded]);

  const navigate = useCallback((name, params = {}) => {
    setStack((s) => [...s, { name, params }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  // Android hardware back button follows the same stack.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, goBack]);

  const allRecipes = useMemo(() => [...RECIPES, ...myRecipes], [myRecipes]);
  const getRecipe = useCallback((id) => allRecipes.find((r) => r.id === id), [allRecipes]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const saveRecipe = useCallback((recipe) => {
    setMyRecipes((list) => {
      const exists = list.some((r) => r.id === recipe.id);
      return exists ? list.map((r) => (r.id === recipe.id ? recipe : r)) : [recipe, ...list];
    });
  }, []);

  const deleteRecipe = useCallback((id) => {
    setMyRecipes((list) => list.filter((r) => r.id !== id));
    setFavorites((f) => f.filter((x) => x !== id));
  }, []);

  const app = {
    navigate,
    goBack,
    category,
    setCategory,
    favorites,
    toggleFavorite,
    isFavorite: (id) => favorites.includes(id),
    myRecipes,
    allRecipes,
    getRecipe,
    saveRecipe,
    deleteRecipe,
  };

  const current = stack[stack.length - 1];
  let screen;
  if (current.name === 'Detail') {
    screen = <RecipeDetailScreen app={app} recipeId={current.params.id} />;
  } else if (current.name === 'Form') {
    screen = <RecipeFormScreen key={current.params.id || 'new'} app={app} recipeId={current.params.id} />;
  } else {
    screen = <HomeScreen app={app} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={styles.inner}>{screen}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  // Keeps a phone-like width when opened in a desktop browser.
  inner: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
});
