import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useClerk } from "@clerk/clerk-expo";

export default function DummyPage() {
  const { signOut } = useClerk();
  return (
    <View>
      <Text>This is a protected page.</Text>
      <TouchableOpacity onPress={() => signOut()}>
        <Text>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
