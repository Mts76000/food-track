import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";
import type { NutritionTotals } from "@/types";

type Props = {
  totals: NutritionTotals;
  valueColor?: string;
  valueSize?: number;
  dividerHeight?: number;
};

export function NutritionSummary({
  totals,
  valueColor = colors.text,
  valueSize = 18,
  dividerHeight = 30,
}: Props) {
  const items = [
    { value: `${Math.round(totals.calories)}`, label: "kcal" },
    { value: `${totals.proteins.toFixed(1)}g`, label: "Protéines" },
    { value: `${totals.carbs.toFixed(1)}g`, label: "Glucides" },
    { value: `${totals.fats.toFixed(1)}g`, label: "Lipides" },
  ];

  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <View style={[styles.divider, { height: dividerHeight }]} />
          )}
          <View style={styles.item}>
            <Text
              style={[styles.value, { color: valueColor, fontSize: valueSize }]}
            >
              {item.value}
            </Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  value: {
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
