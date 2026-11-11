import { useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES } from '../data/recipes';
import { COLORS, SHADOW } from '../theme';
import Header from '../components/Header';
import HeartButton from '../components/HeartButton';
import RecipeImage from '../components/RecipeImage';
import ConfirmModal from '../components/ConfirmModal';

const SPECIAL = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'myfood', name: 'My Food', icon: 'person-outline' },
  { id: 'favorites', name: 'Favorites', icon: 'heart-outline' },
];
const BAR = [...SPECIAL, ...CATEGORIES];

export default function HomeScreen({ app }) {
  const { category, setCategory, navigate } = app;
  const [toDelete, setToDelete] = useState(null);

  let data;
  let title;
  if (category === 'all') {
    data = app.allRecipes;
    title = 'All recipes';
  } else if (category === 'favorites') {
    data = app.favorites.map(app.getRecipe).filter(Boolean);
    title = 'Favorites';
  } else if (category === 'myfood') {
    data = app.myRecipes;
    title = 'My Recipes';
  } else {
    data = app.allRecipes.filter((r) => r.category === category);
    title = CATEGORIES.find((c) => c.id === category)?.name ?? 'Recipes';
  }
  const isMyFood = category === 'myfood';

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => navigate('Detail', { id: item.id })}>
      <RecipeImage uri={item.image} style={styles.cardImage} />
      <View style={styles.heart}>
        <HeartButton active={app.isFavorite(item.id)} onPress={() => app.toggleFavorite(item.id)} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          {item.prepTime ? <Meta icon="time-outline" text={`${item.prepTime} min`} /> : null}
          {item.difficulty ? <Meta icon="speedometer-outline" text={item.difficulty} /> : null}
          {item.calories ? <Meta icon="flame-outline" text={`${item.calories} kcal`} /> : null}
        </View>
        {isMyFood ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => navigate('Form', { id: item.id })}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primaryDark} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setToDelete(item)}>
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.flex}>
      <Header
        title="Foodie"
        right={
          <Pressable
            onPress={() => setCategory('favorites')}
            hitSlop={10}
            accessibilityLabel="Open favorites"
          >
            <Ionicons name="heart" size={26} color={COLORS.heart} />
          </Pressable>
        }
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bar}
        >
          {BAR.map((c) => {
            const active = c.id === category;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Ionicons name={c.icon} size={16} color={active ? '#fff' : COLORS.primary} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.count}>
                {data.length} {data.length === 1 ? 'recipe' : 'recipes'}
              </Text>
            </View>
            {isMyFood ? (
              <Pressable style={styles.addButton} onPress={() => navigate('Form')}>
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Add New Recipe</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={<Empty category={category} />}
      />

      <ConfirmModal
        visible={!!toDelete}
        title="Delete recipe?"
        message={toDelete ? `"${toDelete.name}" will be removed from My Recipes.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          app.deleteRecipe(toDelete.id);
          setToDelete(null);
        }}
      />
    </View>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={COLORS.muted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Empty({ category }) {
  const text =
    category === 'favorites'
      ? 'No favorites yet. Tap the heart on any recipe to save it here.'
      : category === 'myfood'
        ? 'You have not added any recipes yet. Tap "Add New Recipe" to create your first one.'
        : 'No recipes in this category yet.';
  return (
    <View style={styles.empty}>
      <Ionicons
        name={category === 'favorites' ? 'heart-dislike-outline' : 'restaurant-outline'}
        size={48}
        color={COLORS.border}
      />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  count: { color: COLORS.muted, fontSize: 14 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW,
  },
  cardImage: { width: '100%', height: 170 },
  heart: { position: 'absolute', top: 10, right: 10 },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.muted, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtn: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  deleteBtn: { borderColor: '#F3C2C2', backgroundColor: '#FDEEEE' },
  editText: { color: COLORS.primaryDark, fontWeight: '700' },
  deleteText: { color: COLORS.danger, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyText: { color: COLORS.muted, textAlign: 'center', marginTop: 12, fontSize: 15, lineHeight: 21 },
});
