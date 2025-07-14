// components/FormChips.js

import { View, Text, Pressable, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function FormChips({ title, options, selected, onChange, max = 6 }) {
  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      if (selected.length < max) {
        onChange([...selected, option]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chipsContainer}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => toggleOption(option)}
            style={[
              styles.chip,
              selected.includes(option) && styles.chipSelected,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selected.includes(option) && styles.chipTextSelected,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    color: colors.white,
    marginBottom: 10,
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.lightPink,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: colors.lightPink,
  },
  chipText: {
    color: colors.white,
  },
  chipTextSelected: {
    color: colors.purple,
  },
});
