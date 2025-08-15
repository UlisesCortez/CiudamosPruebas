// src/screens/DealsScreen.tsx
import React, { useMemo, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MarkersContext } from "../context/MarkersContext";

const UI = {
  bg: "#F4F7FC",
  card: "#FFFFFF",
  muted: "#6B7280",
  border: "#E7E9ED",
  primary: "#0AC5C5",
  text: "#0D1313",
};

const REWARD_PER_REPORT = 5;

type DealCategory = "Servicios";
type Deal = {
  id: string;
  name: string;
  category: DealCategory;
  discount: string;
  description: string;
  tags: string[];
  logo: ImageSourcePropType;
};

// ---------- ÚNICO ALIADO ----------
const DEALS: Deal[] = [
  {
    id: "tramiweb",
    name: "Tramiweb",
    category: "Servicios",
    discount: "Asesoría personalizada",
    description:
      "Trámites de visas en línea y acompañamiento 1 a 1 durante tu proceso.",
    tags: ["Visas", "Asesoría", "En línea"],
    logo: require("../assets/partners/tramiweb.jpg"),
  },
];

const CATEGORIES: Array<"Todos" | DealCategory> = ["Todos", "Servicios"];

const OFFERS = [
  { percent: 10, cost: 100, code: "TW10" },
  { percent: 15, cost: 130, code: "TW15" },
  { percent: 20, cost: 170, code: "TW20" },
] as const;

const DealsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { markers } = useContext(MarkersContext);
  const tokens = markers.length * REWARD_PER_REPORT;

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<"Todos" | DealCategory>("Todos");
  const [sheetDeal, setSheetDeal] = useState<Deal | null>(null);

  // Filtrado por categoría + texto
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEALS.filter((d) => {
      const byCat = selected === "Todos" || d.category === selected;
      const byText =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.join(" ").toLowerCase().includes(q);
      return byCat && byText;
    });
  }, [selected, query]);

  const onPressMore = (d: Deal) => setSheetDeal(d);
  const closeSheet = () => setSheetDeal(null);

  const renderCard = ({ item }: { item: Deal }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={item.logo} style={styles.logo} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.discount}>{item.discount}</Text>
          <Text style={styles.desc}>{item.description}</Text>

          <View style={styles.tagsRow}>
            {item.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={[styles.pill, { backgroundColor: "#E6FFFB" }]}>
          <Text style={{ color: UI.primary, fontWeight: "700" }}>
            {item.category}
          </Text>
        </View>

        <Pressable
          onPress={() => onPressMore(item)}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.btnText}>Más información</Text>
        </Pressable>
      </View>
    </View>
  );

  // Header full-width (sticky)
  const Header = (
    <View style={styles.stickyHeader}>
      <Text style={styles.header}>Beneficios y Descuentos</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar (ej. Tramiweb, Visas, Servicios)…"
        placeholderTextColor={UI.muted}
        style={styles.search}
      />

      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => String(c)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        renderItem={({ item }) => {
          const active = selected === item;
          return (
            <Pressable
              onPress={() => setSelected(item)}
              hitSlop={8}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && { color: "#fff" }]}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {item}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );

  // --- Modal: hoja inferior SIN deslizamiento (tap fuera para cerrar) ---
  const Sheet = (
    <Modal
      visible={!!sheetDeal}
      transparent
      animationType="fade"
      onRequestClose={closeSheet}
    >
      {/* Tap fuera para cerrar */}
      <Pressable style={styles.backdrop} onPress={closeSheet} />
      {/* Contenedor de la hoja (no cierra al tocar dentro) */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Badge de tokens en la esquina */}
        <View style={styles.tokensBadge}>
          <Text style={styles.tokensText}>{tokens} Tokens</Text>
        </View>

        <View style={styles.sheetHeader}>
          <View style={styles.sheetLogoWrap}>
            <Image
              source={sheetDeal?.logo as ImageSourcePropType}
              style={styles.sheetLogo}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{sheetDeal?.name}</Text>
            <Text style={styles.sheetSub}>Elige tu beneficio</Text>
          </View>
        </View>

        <View style={styles.offersRow}>
          {OFFERS.map((o) => {
            const enough = tokens >= o.cost;
            return (
              <Pressable
                key={o.percent}
                onPress={() => {
                  if (!enough) {
                    Alert.alert(
                      "Tokens insuficientes",
                      `Necesitas ${o.cost} tokens para canjear ${o.percent}%.`
                    );
                    return;
                  }
                  Alert.alert(
                    "Canje listo",
                    `Has canjeado ${o.percent}%.\nCódigo: ${o.code}`,
                    [{ text: "OK", onPress: closeSheet }]
                  );
                }}
                style={[styles.offerCard, !enough && styles.offerDisabled]}
              >
                <Text style={styles.offerPercent}>{o.percent}%</Text>
                <Text style={styles.offerLabel}>descuento</Text>
                <View style={styles.offerDivider} />
                <Text style={styles.offerCost}>{o.cost} tokens</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safe, { paddingBottom: insets.bottom || 8 }]}>
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderCard}
        ListHeaderComponent={Header}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={{ color: UI.muted, textAlign: "center", marginTop: 30 }}>
            No hay resultados con ese filtro.
          </Text>
        }
      />
      {Sheet}
    </SafeAreaView>
  );
};

export default DealsScreen;

/* -------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },

  // Header pegado arriba y a ancho completo
  stickyHeader: {
    backgroundColor: UI.bg,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI.border,
    zIndex: 10,
  },

  header: { fontSize: 22, fontWeight: "900", color: UI.text, marginBottom: 8 },

  search: {
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: UI.text,
    marginBottom: 6,
  },

  chipsContainer: { paddingVertical: 4, alignItems: "center" },

  chip: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: UI.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  chipText: {
    color: UI.text,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
    // @ts-ignore
    includeFontPadding: false,
  },

  card: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  row: { flexDirection: "row", alignItems: "center" },
  logo: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#EAEAEA" },

  title: { color: UI.text, fontSize: 18, fontWeight: "900" },
  discount: { color: UI.primary, fontWeight: "900", marginTop: 2 },
  desc: { color: UI.muted, marginTop: 6 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: {
    backgroundColor: "#F2F7FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: "#4B5A99", fontWeight: "700", fontSize: 12 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },

  btn: {
    backgroundColor: UI.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "900" },

  // --- Modal / Hoja inferior ---
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: UI.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  tokensBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(10,197,197,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tokensText: { color: UI.primary, fontWeight: "900" },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 40, // espacio bajo el badge
  },
  sheetLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EEF6F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sheetLogo: { width: 40, height: 40, borderRadius: 8 },
  sheetTitle: { color: UI.text, fontSize: 18, fontWeight: "900" },
  sheetSub: { color: UI.muted, marginTop: 2 },

  offersRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  offerCard: {
    flex: 1,
    backgroundColor: UI.bg,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  offerDisabled: {
    opacity: 0.45,
  },
  offerPercent: { fontSize: 20, fontWeight: "900", color: UI.text },
  offerLabel: { color: UI.muted, fontWeight: "700", marginTop: 2 },
  offerDivider: {
    height: 1,
    backgroundColor: UI.border,
    alignSelf: "stretch",
    marginVertical: 8,
  },
  offerCost: { color: UI.primary, fontWeight: "900" },
});
