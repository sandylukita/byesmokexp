import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the main app screen
  return <Redirect href="/main" />;
}