// components/HobbyChips.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import baseStyles from '../constants/styles';

// ✅ Single source of truth for hobby icons (used everywhere)
const HOBBY_ICONS = {
  Hiking: 'trail-sign',
  Cooking: 'restaurant',
  Dancing: 'walk',
  Traveling: 'airplane',
  Movies: 'film',
  'Board Games': 'dice',
  Gym: 'barbell',
  Reading: 'book',
  Sports: 'baseball',
  Coffee: 'cafe',
  Dogs: 'paw',
  Cats: 'paw',
  Volunteering: 'heart',
  'Live Music': 'musical-notes',
  Picnics: 'briefcase',
  'Mini Golf': 'golf',
  Photography: 'camera',
  Beach: 'sunny',
  Karaoke: 'mic',
  Art: 'color-palette',
  Biking: 'bicycle',
  Yoga: 'body',
  Camping: 'bonfire',
  Bowling: 'bowling-ball',
  'Video Games': 'game-controller',
  Foodie: 'pizza',
};

function getHobbyIcon(hobby) {
  return HOBBY_ICONS[hobby] || 'star';
}

/**
 * Props
 * - items: array of hobbies to render (for display mode, this can be selected hobbies only)
 * - selected: array of selected hobbies (used for select mode)
 * - onToggle: function(hobby) (optional; if missing, component becomes non-interactive)
 * - maxSelected: number (optional, enforce cap in select mode)
 * - mode: 'select' | 'display'
 * - iconSize: number
 * - activeIconColor / inactiveIconColor (select mode)
 * - chipStyleOverride / textStyleOverride / rowStyleOverride (optional)
 * - displayChipBackgroundColor, displayChipBorderColor, displayTextColor, displayIconColor (display mode)
 * - wrap: boolean (default true)
 */
export default function HobbyChips({
  items = [],
  selected = [],
  onToggle,
  maxSelected,
  mode = 'display',
  iconSize = 16,

  // select-mode colors
  activeIconColor = '#440544',
  inactiveIconColor = '#eee',

  // select-mode styling uses your existing base styles
  rowStyleOverride,
  chipStyleOverride,
  textStyleOverride,

  // display-mode colors
  displayChipBackgroundColor = '#A828AA',
  displayChipBorderColor = '#A828AA',
  displayTextColor = '#fff',
  displayIconColor = '#fff',

  wrap = true,
}) {
  const isSelectMode = mode === 'select';
  const canPress = typeof onToggle === 'function';

  const renderChip = (hobby) => {
    const isSelected = selected.includes(hobby);

    if (isSelectMode) {
      const iconColor = isSelected ? activeIconColor : inactiveIconColor;

      const disabled =
        typeof maxSelected === 'number' &&
        !isSelected &&
        selected.length >= maxSelected;

      return (
        <Pressable
          key={hobby}
          onPress={() => {
            if (!canPress) return;
            if (disabled) return;
            onToggle(hobby);
          }}
          style={[
            baseStyles.optionButton,
            isSelected && baseStyles.selectedOption,
            local.chipRow,
            chipStyleOverride,
            disabled && local.disabledChip,
          ]}
        >
          <Ionicons
            name={getHobbyIcon(hobby)}
            size={iconSize}
            color={iconColor}
            style={local.icon}
          />
          <Text
            style={[
              baseStyles.optionText,
              isSelected && baseStyles.selectedOptionText,
              textStyleOverride,
            ]}
          >
            {hobby}
          </Text>
        </Pressable>
      );
    }

    // display mode (non-pressable, consistent)
    return (
      <View
        key={hobby}
        style={[
          baseStyles.optionButton,
          local.chipRow,
          {
            backgroundColor: displayChipBackgroundColor,
            borderColor: displayChipBorderColor,
          },
          chipStyleOverride,
        ]}
      >
        <Ionicons
          name={getHobbyIcon(hobby)}
          size={iconSize}
          color={displayIconColor}
          style={local.icon}
        />
        <Text
          style={[
            baseStyles.optionText,
            { color: displayTextColor },
            textStyleOverride,
          ]}
        >
          {hobby}
        </Text>
      </View>
    );
  };

  return (
    <View style={[baseStyles.row, wrap && local.wrap, rowStyleOverride]}>
      {items.map(renderChip)}
    </View>
  );
}

const local = StyleSheet.create({
  wrap: {
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  disabledChip: {
    opacity: 0.5,
  },
});
