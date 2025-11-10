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
    console.log('📸 captureShareCard: Starting capture...');
    console.log('📸 viewRef:', viewRef);
    console.log('📸 viewRef.current:', viewRef.current);

    const uri = await captureRef(viewRef, {
      format: options.format || 'png',
      quality: options.quality || 1,
      result: 'tmpfile',
    });

    console.log('✅ Capture successful! URI:', uri);
    return uri;
  } catch (error) {
    console.error('❌ captureShareCard error:', error);
    throw new Error(`Failed to capture image: ${error}`);
  }
};

/**
 * Save image to device gallery
 */
export const saveToGallery = async (uri: string): Promise<boolean> => {
  try {
    console.log('💾 saveToGallery: Requesting permissions...');
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    console.log('💾 Permission status:', status);

    if (status !== 'granted') {
      console.error('❌ Permission denied');
      return false;
    }

    // Save to gallery
    console.log('💾 Saving to gallery...');
    await MediaLibrary.createAssetAsync(uri);
    console.log('✅ Saved to gallery successfully!');

    return true;
  } catch (error) {
    console.error('❌ saveToGallery error:', error);
    return false;
  }
};

/**
 * Share to Instagram Story
 */
export const shareToInstagramStory = async (uri: string): Promise<boolean> => {
  try {
    // Just use the regular share dialog - same as generic share
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share to Instagram',
      });
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Generic share using native share sheet
 */
export const shareGeneric = async (uri: string, message?: string): Promise<boolean> => {
  try {
    console.log('📤 shareGeneric: Starting share...', { uri, platform: Platform.OS });

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const isAvailable = await Sharing.isAvailableAsync();
      console.log('📤 Sharing available:', isAvailable);

      if (isAvailable) {
        console.log('📤 Opening share dialog...');
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: message || 'Share your smoke-free achievement',
        });
        console.log('✅ Share dialog completed');
        return true;
      }
    }

    // Fallback to React Native Share for text/URL
    console.log('📤 Using fallback React Native Share...');
    await Share.share({
      message: message || 'Check out my smoke-free progress with ByeSmoke AI! 🚭',
    });

    return true;
  } catch (error) {
    console.error('❌ shareGeneric error:', error);
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
    console.log('🎯 shareAchievementCard: Action:', action);

    // Capture the card first
    const uri = await captureShareCard(viewRef);
    console.log('🎯 Captured URI:', uri);

    // Execute the desired action
    switch (action) {
      case 'instagram':
        console.log('🎯 Executing Instagram share...');
        return await shareToInstagramStory(uri);
      case 'save':
        console.log('🎯 Executing save to gallery...');
        return await saveToGallery(uri);
      case 'share':
        console.log('🎯 Executing generic share...');
        return await shareGeneric(uri, message);
      default:
        console.error('❌ Unknown action:', action);
        return false;
    }
  } catch (error) {
    console.error('❌ shareAchievementCard error:', error);
    return false;
  }
};
