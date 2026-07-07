import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

type Lead = {
  id: number;
  name: string;
  contact: string;
  monthly_bill: number;
  created_at: string;
};

// Color Palette mapping from your design tokens
const COLORS = {
  bgMain: "#f7f8fb",
  bgSecondary: "#ffffff",
  surface: "#eef1f6",
  brandDark: "#0b0b0f",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  accentPrimary: "#ffb000",
  accentSecondary: "#ff7a18",
};

export default function HomeScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = () => {
    fetch("http://10.225.218.35:5000/api/test")
      .then(async (res) => {
        if (!res.ok) throw new Error("Network response error");
        const data = await res.json();
        setLeads(data);
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to load leads.");
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const copyNumber = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    Alert.alert("Copied", "Phone number copied.");
  };

  const deleteLead = async (id: number) => {
    Alert.alert("Delete Lead", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `http://10.225.218.35:5000/api/test/${id}`,
              { method: "DELETE" },
            );

            if (response.ok) {
              fetchLeads();
            } else {
              Alert.alert("Delete Failed");
            }
          } catch (err) {
            console.log(err);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solar Leads</Text>

      {/* Main content viewport matching your wireframe inner block container */}
      <View style={styles.wireframeInnerBox}>
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.id}>ID : {item.id}</Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.bill}>Monthly Bill: ₹{item.monthly_bill}</Text>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.btn, styles.callBtn]}
                  onPress={() => callNumber(item.contact)}
                >
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.copyBtn]}
                  onPress={() => copyNumber(item.contact)}
                >
                  <Text style={styles.copyBtnText}>📋 Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.deleteBtn]}
                  onPress={() => deleteLead(item.id)}
                >
                  <Text style={styles.deleteBtnText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Dedicated bottom row containing the reload action element from your wireframe */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.reload} onPress={fetchLeads}>
          <Text style={styles.reloadText}>🔄 Reload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.brandDark,
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  wireframeInnerBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    overflow: "hidden",
  },
  listContent: {
    paddingBottom: 10,
  },
  card: {
    backgroundColor: COLORS.bgSecondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    paddingBottom: 6,
    marginBottom: 8,
  },
  id: {
    fontWeight: "700",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  date: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  bill: {
    marginTop: 4,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  callBtn: {
    backgroundColor: COLORS.accentPrimary,
  },
  callBtnText: {
    color: COLORS.brandDark,
    fontWeight: "700",
    fontSize: 13,
  },
  copyBtn: {
    backgroundColor: COLORS.surface,
  },
  copyBtnText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 13,
  },
  bottomBar: {
    height: 70,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: 10,
  },
  reload: {
    backgroundColor: COLORS.brandDark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reloadText: {
    color: COLORS.bgSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
});