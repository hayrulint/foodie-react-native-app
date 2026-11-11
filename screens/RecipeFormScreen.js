import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { COLORS } from '../theme';
import Header from '../components/Header';
import RecipeImage from '../components/RecipeImage';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function RecipeFormScreen({ app, recipeId }) {
  const existing = recipeId ? app.getRecipe(recipeId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [image, setImage] = useState(existing?.image ?? null);
  const [ingredients, setIngredients] = useState(existing?.ingredients?.length ? existing.ingredients : ['']);
  const [steps, setSteps] = useState(existing?.instructions?.length ? existing.instructions : ['']);
  const [prepTime, setPrepTime] = useState(existing?.prepTime ? String(existing.prepTime) : '');
  const [servings, setServings] = useState(existing?.servings ? String(existing.servings) : '');
  const [calories, setCalories] = useState(existing?.calories ? String(existing.calories) : '');
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? 'Easy');
  const [error, setError] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  };

  const updateAt = (setter) => (index, value) =>
    setter((list) => list.map((v, i) => (i === index ? value : v)));
  const removeAt = (setter) => (index) =>
    setter((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : ['']));

  const save = () => {
    const cleanIngredients = ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) return setError('Please enter a recipe name.');
    if (!cleanIngredients.length) return setError('Please add at least one ingredient.');
    if (!cleanSteps.length) return setError('Please add at least one instruction step.');

    app.saveRecipe({
      id: existing?.id ?? `user-${Date.now()}`,
      isUserRecipe: true,
      category: 'myfood',
      name: name.trim(),
      image,
      ingredients: cleanIngredients,
      instructions: cleanSteps,
      prepTime: parseInt(prepTime, 10) || null,
      servings: parseInt(servings, 10) || null,
      calories: parseInt(calories, 10) || null,
      difficulty,
    });
    app.setCategory('myfood');
    app.goBack();
  };

  return (
    <View style={styles.flex}>
      <Header title={existing ? 'Edit Recipe' : 'Add New Recipe'} onBack={app.goBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Recipe name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Grandma's apple pie"
            placeholderTextColor={COLORS.muted}
          />

          <Text style={styles.label}>Image</Text>
          <Pressable style={styles.imageBox} onPress={pickImage}>
            {image ? (
              <RecipeImage uri={image} style={styles.imagePreview} />
            ) : (
              <View style={styles.imageEmpty}>
                <Ionicons name="cloud-upload-outline" size={34} color={COLORS.primary} />
                <Text style={styles.imageText}>Upload image</Text>
              </View>
            )}
          </Pressable>
          {image ? (
            <View style={styles.imageActions}>
              <Pressable onPress={pickImage}>
                <Text style={styles.link}>Change image</Text>
              </Pressable>
              <Pressable onPress={() => setImage(null)}>
                <Text style={[styles.link, { color: COLORS.danger }]}>Remove</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.label}>Ingredients</Text>
          {ingredients.map((value, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.dot} />
              <TextInput
                style={[styles.input, styles.flex]}
                value={value}
                onChangeText={(t) => updateAt(setIngredients)(i, t)}
                placeholder={`Ingredient ${i + 1}`}
                autoFocus={i > 0 && i === ingredients.length - 1 && !value}
                placeholderTextColor={COLORS.muted}
              />
              <Pressable onPress={() => removeAt(setIngredients)(i)} hitSlop={8} style={styles.remove}>
                <Ionicons name="close-circle" size={22} color={COLORS.muted} />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addRow} onPress={() => setIngredients((l) => [...l, ''])}>
            <Ionicons name="add" size={18} color={COLORS.primary} />
            <Text style={styles.link}>Add ingredient</Text>
          </Pressable>

          <Text style={styles.label}>Step-by-step instructions</Text>
          {steps.map((value, i) => (
            <View key={i} style={[styles.listRow, styles.stepRow]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.flex, styles.multiline]}
                value={value}
                onChangeText={(t) => updateAt(setSteps)(i, t)}
                placeholder={`Describe step ${i + 1}`}
                autoFocus={i > 0 && i === steps.length - 1 && !value}
                placeholderTextColor={COLORS.muted}
                multiline
              />
              <Pressable onPress={() => removeAt(setSteps)(i)} hitSlop={8} style={styles.remove}>
                <Ionicons name="close-circle" size={22} color={COLORS.muted} />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addRow} onPress={() => setSteps((l) => [...l, ''])}>
            <Ionicons name="add" size={18} color={COLORS.primary} />
            <Text style={styles.link}>Add step</Text>
          </Pressable>

          <Text style={styles.label}>Details (optional)</Text>
          <View style={styles.detailsRow}>
            <NumberField label="Prep (min)" value={prepTime} onChange={setPrepTime} />
            <NumberField label="Servings" value={servings} onChange={setServings} />
            <NumberField label="Calories" value={calories} onChange={setCalories} />
          </View>
          <View style={styles.segment}>
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d}
                style={[styles.segmentItem, difficulty === d && styles.segmentActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.segmentText, difficulty === d && styles.segmentTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={styles.saveButton} onPress={save}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveText}>Save Recipe</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <View style={styles.flex}>
      <Text style={styles.smallLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={COLORS.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 18, marginBottom: 8 },
  smallLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  multiline: { minHeight: 44, textAlignVertical: 'top' },
  imageBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: COLORS.primarySoft,
  },
  imageEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  imageText: { color: COLORS.primaryDark, fontWeight: '700' },
  imagePreview: { width: '100%', height: '100%' },
  imageActions: { flexDirection: 'row', gap: 20, marginTop: 8 },
  link: { color: COLORS.primary, fontWeight: '700' },
  listRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepRow: { alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 10 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 9,
  },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  remove: { marginLeft: 8, marginTop: 2 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  detailsRow: { flexDirection: 'row', gap: 10 },
  segment: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
  },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentText: { fontWeight: '600', color: COLORS.text },
  segmentTextActive: { color: '#fff' },
  error: { color: COLORS.danger, marginTop: 16, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
  },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
