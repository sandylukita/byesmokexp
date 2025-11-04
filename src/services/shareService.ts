/**
 * Share Service
 *
 * Handles capturing and sharing achievement cards (Strava-style)
 */

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Share, Alert } from 'react-native';

export interface ShareOptions {
  format?: 'png' | 'jpg';
  quality?: number;
}

/**
 * Capture a view as an image
 */
export const captureShareCard = async (
  viewRef: any,
  options: ShareOptions = {}
): Promise<string> => {
  try {
    const uri = await captureRef(viewRef, {
      format: options.format || 'png',
      quality: options.quality || 1,
      result: 'tmpfile',
    });

    return uri;
  } catch (error) {
    throw new Error('Failed to capture image');
  }
};

/**
 * Save image to device gallery
 */
export const saveToGallery = async (uri: string): Promise<boolean> => {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to save images to your gallery'
      );
      return false;
    }

    // Save to gallery
    await MediaLibrary.createAssetAsync(uri);

    Alert.alert(
      'Success!',
      'Your smoke-free achievement has been saved to your gallery! 🎉'
    );

    return true;
  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to save image to gallery. Please try again.'
    );
    return false;
  }
};

/**
 * Share to Instagram Story
 */
export const shareToInstagramStory = async (uri: string): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert(
        'Sharing Not Available',
        'Sharing is not available on this device'
      );
      return false;
    }

    // On iOS, we can use the Instagram URL scheme
    // On Android, we use the general share dialog
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your smoke-free achievement',
    });

    return true;
  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to share to Instagram. Please try again.'
    );
    return false;
  }
};

/**
 * Generic share using native share sheet
 */
export const shareGeneric = async (uri: string, message?: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: message || 'Share your smoke-free achievement',
        });
        return true;
      }
    }

    // Fallback to React Native Share for text/URL
    await Share.share({
      message: message || 'Check out my smoke-free progress with ByeSmoke AI! 🚭',
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Main share function with multiple options
 */
export const shareAchievementCard = async (
  viewRef: any,
  action: 'instagram' | 'save' | 'share',
  message?: string
): Promise<boolean> => {
  try {
    // Capture the card first
    const uri = await captureShareCard(viewRef);

    // Execute the desired action
    switch (action) {
      case 'instagram':
        return await shareToInstagramStory(uri);
      case 'save':
        return await saveToGallery(uri);
      case 'share':
        return await shareGeneric(uri, message);
      default:
        return false;
    }
  } catch (error) {
    Alert.alert(
      'Error',
      'Something went wrong. Please try again.'
    );
    return false;
  }
};
