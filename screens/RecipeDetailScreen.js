import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES } from '../data/recipes';
import { COLORS, SHADOW } from '../theme';
import Header from '../components/Header';
import HeartButton from '../components/HeartButton';
import RecipeImage from '../components/RecipeImage';
import ConfirmModal from '../components/ConfirmModal';

export default function RecipeDetailScreen({ app, recipeId }) {
  const recipe = app.getRecipe(recipeId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!recipe) {
    return (
      <View style={styles.flex}>
        <Header title="Recipe" onBack={app.goBack} />
        <Text style={styles.missing}>This recipe no longer exists.</Text>
      </View>
    );
  }

  const isMine = !!recipe.isUserRecipe;
  const categoryName = isMine
    ? 'My Food'
    : CATEGORIES.find((c) => c.id === recipe.category)?.name;

  const stats = [
    { icon: 'time-outline', label: 'Prep time', value: recipe.prepTime ? `${recipe.prepTime} min` : '—' },
    { icon: 'people-outline', label: 'Servings', value: recipe.servings ? String(recipe.servings) : '—' },
    { icon: 'flame-outline', label: 'Calories', value: recipe.calories ? `${recipe.calories} kcal` : '—' },
    { icon: 'speedometer-outline', label: 'Difficulty', value: recipe.difficulty || '—' },
  ];

  return (
    <View style={styles.flex}>
      <Header
        title={recipe.name}
        onBack={app.goBack}
        right={
          <HeartButton
            active={app.isFavorite(recipe.id)}
            onPress={() => app.toggleFavorite(recipe.id)}
            filledBg={false}
            size={26}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <RecipeImage uri={recipe.image} style={styles.image} />

        <View style={styles.titleRow}>
          <View style={styles.flex}>
            {categoryName ? <Text style={styles.badge}>{categoryName}</Text> : null}
            <Text style={styles.name}>{recipe.name}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Ionicons name={s.icon} size={22} color={COLORS.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.box}>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} style={styles.ingredient}>
              <View style={styles.dot} />
              <Text style={styles.ingredientText}>{ing}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.box}>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {isMine ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => app.navigate('Form', { id: recipe.id })}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setConfirmDelete(true)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={confirmDelete}
        title="Delete recipe?"
        message={`"${recipe.name}" will be removed from My Recipes.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          app.deleteRecipe(recipe.id);
          app.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { textAlign: 'center', marginTop: 40, color: COLORS.muted },
  content: { padding: 16, paddingBottom: 40 },
  image: { width: '100%', height: 240, borderRadius: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  name: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  stats: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
    ...SHADOW,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  statLabel: { fontSize: 12, color: COLORS.muted },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 24, marginBottom: 10 },
  box: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, ...SHADOW },
  ingredient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 12 },
  ingredientText: { fontSize: 15, color: COLORS.text, flex: 1 },
  step: { flexDirection: 'row', paddingVertical: 8 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, color: COLORS.text, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  editBtn: { backgroundColor: COLORS.primary },
  deleteBtn: { backgroundColor: '#FDEEEE', borderWidth: 1, borderColor: '#F3C2C2' },
  editText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deleteText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
