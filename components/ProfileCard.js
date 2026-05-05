import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import HobbyChips from './HobbyChips';
import colors from '../constants/colors';

const PINK = '#A828AA';

function formatDistanceBucket(distanceMiles) {
  if (typeof distanceMiles !== 'number' || Number.isNaN(distanceMiles)) return 'N/A';
  if (distanceMiles < 10) return '< 10 mi';
  if (distanceMiles < 15) return '< 15 mi';
  if (distanceMiles < 20) return '< 20 mi';
  if (distanceMiles < 30) return '< 30 mi';
  if (distanceMiles < 50) return '< 50 mi';
  if (distanceMiles < 75) return '< 75 mi';
  if (distanceMiles < 100) return '< 100 mi';
  return '100+ mi';
}

function getFirstName(fullName) {
  if (!fullName || typeof fullName !== 'string') return '';
  return fullName.trim().split(/\s+/)[0];
}

function isYes(value) {
  if (value === true) return true;
  if (!value) return false;
  return String(value).toLowerCase().trim() === 'yes';
}

function showValue(v) {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'string') return v.trim() ? v.trim() : 'N/A';
  return String(v);
}

export default function ProfileCard({
  // data
  name,
  age,
  image,
  distanceMiles,
  denomination,
  maritalStatus,
  hasChildren,
  drinking,
  smoking,
  hobbies,
  aboutMe,
  photos,

  // display
  variant = 'preview', // 'preview' | 'full'
}) {
  const isFull = variant === 'full';

  const firstName = getFirstName(name);
  const distanceLabel = formatDistanceBucket(distanceMiles);

  const showDrink = isYes(drinking);
  const showSmoke = isYes(smoking);

  const kidsSuffix = isYes(hasChildren) ? ' with kids' : '';

  const ageText = age != null && String(age).trim() !== '' ? `${age} y/o` : null;

  const denomText =
    denomination && String(denomination).trim() ? String(denomination).trim() : null;

  const maritalText =
    maritalStatus && String(maritalStatus).trim()
      ? `${String(maritalStatus).trim()}${kidsSuffix}`
      : null;

  const metaLine = [ageText, denomText, maritalText].filter(Boolean).join(' • ');

  const list = Array.isArray(hobbies)
    ? [...hobbies].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];

  const photoArray = Array.isArray(photos) ? photos : [];
  const photo2 = photoArray[1] || null;
  const photo3 = photoArray[2] || null;

  return (
    <View style={[styles.wrapper, isFull && styles.wrapperFull]}>
      <View style={[styles.card, isFull && styles.cardFull]}>
        <View style={[styles.imageWrap, isFull && styles.imageWrapFull]}>
          <Image source={{ uri: image }} style={[styles.image, isFull && styles.imageFull]} />
        </View>

        <View style={[styles.info, isFull && styles.infoFull]}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.distance}>{distanceLabel}</Text>
          </View>

          {(metaLine || showDrink || showSmoke) ? (
            <View style={styles.metaRow}>
              {metaLine ? <Text style={styles.metaText}>{metaLine}</Text> : null}

              {(showDrink || showSmoke) ? (
                <View style={styles.iconRow}>
                  {showDrink ? (
                    <Ionicons name="pint" size={16} color={PINK} style={styles.inlineIcon} />
                  ) : null}

                  {showSmoke ? (
                    <Ionicons
                      name="color-wand"
                      size={16}
                      color={PINK}
                      style={styles.inlineIcon}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.detailsClip, isFull && styles.detailsFull]}>
            <View style={styles.section}>
              <Text style={styles.label}>Hobbies & Interests</Text>

              {list.length ? (
                <HobbyChips
                  mode="display"
                  items={list.slice(0, 50)}
                  displayChipBackgroundColor={PINK}
                  displayChipBorderColor={PINK}
                  displayTextColor="#fff"
                  displayIconColor="#fff"
                  iconSize={14}
                />
              ) : (
                <Text style={styles.value}>N/A</Text>
              )}
            </View>

            {photo2 ? (
              <View style={styles.inlinePhotoWrap}>
                <Image source={{ uri: photo2 }} style={styles.inlinePhoto} />
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.label}>About Me</Text>
              <Text style={styles.value}>{showValue(aboutMe)}</Text>
            </View>

            {photo3 ? (
              <View style={styles.inlinePhotoWrap}>
                <Image source={{ uri: photo3 }} style={styles.inlinePhoto} />
              </View>
            ) : null}

            {!isFull ? (
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                style={styles.fade}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 10 },
  wrapperFull: { flex: 0, padding: 0 },

  card: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  cardFull: {
    flex: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  imageWrap: { padding: 10 },
  imageWrapFull: { padding: 16, paddingBottom: 10 },

  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    resizeMode: 'contain',
    backgroundColor: '#f3f3f3',
  },
  imageFull: {
    borderRadius: 12,
  },

  info: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  infoFull: { flex: 0 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },

  name: { fontSize: 22, fontWeight: 'bold', flexShrink: 1 },
  distance: { fontSize: 14, fontWeight: '700', color: PINK },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },

  metaText: { fontSize: 14, fontWeight: '600', color: '#444' },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  inlineIcon: { marginLeft: 6 },

  detailsClip: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 26,
  },
  detailsFull: {
    flex: 0,
    overflow: 'visible',
    paddingBottom: 0,
  },

  section: { marginBottom: 12 },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  value: { fontSize: 15, fontWeight: '600', color: '#333' },

  inlinePhotoWrap: {
    width: '100%',
    marginBottom: 12,
  },

  inlinePhoto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    resizeMode: 'cover',
    backgroundColor: colors.purple,
  },

  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
  },
});
