import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/theme';
import MI from 'react-native-vector-icons/MaterialIcons';

export const ListItem: React.FC<{ title: string; subtitle?: string; color?: string; onPress?: () => void; right?: React.ReactNode; }> =
({ title, subtitle, color, onPress, right }) => {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ padding: spacing(3), borderRadius: radius.md, backgroundColor: colors.surface, borderWidth:1, borderColor: colors.border, flexDirection:'row', alignItems:'center', gap: spacing(2) }}>
      <View style={{ width:10, height:10, borderRadius:5, backgroundColor: color || colors.primary }} />
      <View style={{ flex:1 }}>
        <Text numberOfLines={1} style={[typography.h2, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text numberOfLines={2} style={[typography.caption, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
      {right ?? <MI name="chevron-right" size={20} color={colors.muted} />}
    </Pressable>
  );
};

