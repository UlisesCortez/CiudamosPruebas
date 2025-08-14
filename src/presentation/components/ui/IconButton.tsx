import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/theme';
import MI from 'react-native-vector-icons/MaterialIcons';

type Props = { name: string; size?: number; onPress?: () => void; style?: ViewStyle; tint?: string; };

const IconButton: React.FC<Props> = ({ name, onPress, size=22, style, tint }) => {
  const { colors, radius } = useTheme();
  const bg = tint ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,.2)', borderless: true, radius: 28 }}
      style={[{ width: 56, height: 56, borderRadius: radius.full, backgroundColor: bg, alignItems:'center', justifyContent:'center' }, style]}
    >
      <MI name={name as any} size={size} color="#fff" />
    </Pressable>
  );
};
export default IconButton;
