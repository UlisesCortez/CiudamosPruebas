import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export const ProfileCircle = () => {
  return (
    <View style={styles.topRightCircle}>
      <Image
        source={require('../../assets/images/LogoDark.png')}
        style={styles.imageInCircle}
      />
      <Text style={styles.imageLabel}>Mi perfil</Text>
    </View>
  );
};

export default ProfileCircle;

const styles = StyleSheet.create({
  topRightCircle: {
    position: 'absolute',
    top: 30,
    right: 40,
    alignItems: 'center',
  },
  imageInCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  imageLabel: {
    marginTop: 6,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});


