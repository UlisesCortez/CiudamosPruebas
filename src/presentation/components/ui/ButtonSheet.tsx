import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, PanResponder, Dimensions } from 'react-native';

interface Props {
  initialHeight: number;
  children: React.ReactNode;
  onClose: () => void;  
}

const screenHeight = Dimensions.get('window').height;

const BottomSheet: React.FC<Props> = ({ initialHeight, children, onClose }) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          Animated.timing(translateY, {
            toValue: screenHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onClose(); 
          });
        } else {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0, 
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.sheet,
        {
          height: initialHeight,
          transform: [{ translateY }],
        },
      ]}
    >
    
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    //top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});