import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/theme';

const Card: React.FC<React.PropsWithChildren<{style?: ViewStyle}>> = ({ children, style }) => {
  const { colors, radius, shadow } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, }, shadow(10), style]}>
      {children}
    </View>
  );
};
export default Card;
