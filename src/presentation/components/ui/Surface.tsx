import React from 'react';
import { View, StatusBar } from 'react-native';
import { useTheme } from '../../../theme/theme';

const Surface: React.FC<React.PropsWithChildren<{padding?: number}>> = ({ children, padding }) => {
  const { colors, scheme } = useTheme();
  return (
    <View style={{ flex:1, backgroundColor: colors.bg, padding }}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      {children}
    </View>
  );
};
export default Surface;
