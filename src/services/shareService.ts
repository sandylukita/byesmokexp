/**
 * Share Service
 *
 * Handles capturing and sharing achievement cards (Strava-style)
 */

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Share, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
      return false;
    }

    // Save to gallery
    await MediaLibrary.createAssetAsync(uri);

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Share to Instagram Story
 */
export const shareToInstagramStory = async (uri: string): Promise<boolean> => {
  try {
    // Save to gallery first (Instagram needs file access)
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === 'granted') {
      await MediaLibrary.createAssetAsync(uri);
    }

    // Use the native share sheet filtered to Instagram
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      // Share with Instagram as the target
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share to Instagram',
        UTI: 'image/png', // iOS specific
      });
      return true;
    }

    return false;
  } catch (error) {
    console.log('Instagram share error:', error);
    // Fallback to share dialog
    try {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your achievement',
      });
      return true;
    } catch (fallbackError) {
      return false;
    }
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
    return false;
  }
};
