import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to sign-in screen
  return <Redirect href="/sign-in" />;
}
